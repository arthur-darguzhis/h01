import {UserInputModel} from "../user/types/UserInputModel";
import {UserRepository} from "../user/repository/user.MongoDbRepository";
import {EntityAlreadyExists} from "../../common/exceptions/EntityAlreadyExists";
import {User} from "../user/types/UserType";
import {emailsManager} from "../../common/managers/email/emailsManager";
import bcrypt from "bcrypt";
import {EmailConfirmation} from "./emailConfirmation/types/EmailConfirmation";
import {EmailConfirmationRepository} from "./emailConfirmation/repository/emailConfirmation.MongoDbRepository";
import {SecurityService} from "../security/securityService";
import {PasswordRecoveryInputModel} from "./types/PasswordRecoveryInputModel";
import {PasswordRecovery} from "./passwordRecovery/types/PasswordRecoveryType";
import {NewPasswordRecoveryInputModel} from "./types/NewPasswordRecoveryInputModel";
import {PasswordRecoveryRepository} from "./passwordRecovery/passwordRecoveryRepository";
import {UnprocessableEntity} from "../../common/exceptions/UnprocessableEntity";
import {injectable} from "inversify";

@injectable()
export class AuthService {
    constructor(
        protected securityService: SecurityService,
        protected passwordRecoveryRepository: PasswordRecoveryRepository,
        protected emailConfirmationRepository: EmailConfirmationRepository,
        protected userRepository: UserRepository
    ) {
    }

    async registerNewUser(userInputModel: UserInputModel): Promise<[user: User, emailConfirmation: EmailConfirmation] | never> {
        const isUserExists = await this.userRepository.isExistsWithSameEmailOrLogin(userInputModel.email, userInputModel.login);
        if (isUserExists) {
            throw new EntityAlreadyExists('User with the same "email" or "login" is already exists')
        }
        const passwordHash = await this._generatePasswordHash(userInputModel.password)

        const newUser: User = new User(
            userInputModel.login,
            passwordHash,
            userInputModel.email,
            false
        )

        const emailConfirmation = new EmailConfirmation(newUser._id)

        emailsManager.sendRegistrationConfirmationLetter(newUser, emailConfirmation)
        await this.userRepository.add(newUser);
        await this.emailConfirmationRepository.add(emailConfirmation)

        return [newUser, emailConfirmation];
    }

    async _generatePasswordHash(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    async removeUserSession(refreshToken: string) {
        return this.securityService.removeUserSession(refreshToken);
    }

    async passwordRecovery(passwordRecoveryInputModel: PasswordRecoveryInputModel): Promise<PasswordRecovery | never> {
        const user = await this.userRepository.getUserByEmail(passwordRecoveryInputModel.email)

        const passwordRecovery = new PasswordRecovery(user._id)
        emailsManager.sendPasswordRecoveryLetter(user, passwordRecovery)
        await this.passwordRecoveryRepository.add(passwordRecovery);
        return passwordRecovery
    }

    async setNewPassword(newPasswordRecoveryInputModel: NewPasswordRecoveryInputModel): Promise<PasswordRecovery> {
        const {newPassword, recoveryCode,} = newPasswordRecoveryInputModel
        const passwordRecovery = await this.passwordRecoveryRepository.getByCode(recoveryCode)

        if (passwordRecovery.expirationDate < new Date().getTime()) {
            throw new UnprocessableEntity('The password recovery code is expired');
        }
        const newPasswordHash = await this._generatePasswordHash(newPassword)
        await this.userRepository.setNewPassword(passwordRecovery.userId, newPasswordHash)

        return passwordRecovery;
    }
}
