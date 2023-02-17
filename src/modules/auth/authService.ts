import {UserInputModel} from "../user/types/UserInputModel";
import {userRepository} from "../user/repository/user.MongoDbRepository";
import {EntityAlreadyExists} from "../../common/exceptions/EntityAlreadyExists";
import {User} from "../user/types/UserType";
import {emailsManager} from "../../common/managers/email/emailsManager";
import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";
import add from "date-fns/add";
import bcrypt from "bcrypt";
import {EmailConfirmationType} from "./emailConfirmation/types/EmailConfirmationType";
import {emailConfirmationRepository} from "./emailConfirmation/repository/emailConfirmation.MongoDbRepository";
import {securityService} from "../security/security.service";
import {PasswordRecoveryInputModel} from "./types/PasswordRecoveryInputModel";
import {PasswordRecoveryType} from "./passwordRecovery/types/PasswordRecoveryType";
import {NewPasswordRecoveryInputModel} from "./types/NewPasswordRecoveryInputModel";
import {passwordRecoveryRepository} from "./passwordRecovery/passwordRecoveryRepository";
import {UnprocessableEntity} from "../../common/exceptions/UnprocessableEntity";

class AuthService {
    async registerNewUser(userInputModel: UserInputModel): Promise<[user: User, emailConfirmation: EmailConfirmationType] | never> {
        const isUserExists = await userRepository.isExistsWithSameEmailOrLogin(userInputModel.email, userInputModel.login);
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

        const emailConfirmation: EmailConfirmationType = {
            _id: new ObjectId().toString(),
            userId: newUser._id,
            confirmationCode: uuidv4(),
            expirationDate: add(new Date(), {hours: 10, minutes: 3}).getTime(),
            sendingTime: new Date().getTime(),
            isConfirmed: false,
        }

        emailsManager.sendRegistrationConfirmationLetter(newUser, emailConfirmation)
        await userRepository.add(newUser);
        await emailConfirmationRepository.add(emailConfirmation)

        return [newUser, emailConfirmation];
    }

    async _generatePasswordHash(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    async removeUserSession(refreshToken: string) {
        return securityService.removeUserSession(refreshToken);
    }

    async passwordRecovery(passwordRecoveryInputModel: PasswordRecoveryInputModel): Promise<PasswordRecoveryType | never> {
        const user = await userRepository.getUserByEmail(passwordRecoveryInputModel.email)

        const passwordRecovery: PasswordRecoveryType = {
            _id: new ObjectId().toString(),
            userId: user._id,
            code: uuidv4(),
            expirationDate: add(new Date(), {hours: 24}).getTime(),
            sendingTime: new Date().getTime(),
            isConfirmed: false,
        }
        emailsManager.sendPasswordRecoveryLetter(user, passwordRecovery)
        await passwordRecoveryRepository.add(passwordRecovery);
        return passwordRecovery
    }

    async setNewPassword(newPasswordRecoveryInputModel: NewPasswordRecoveryInputModel): Promise<PasswordRecoveryType> {
        const {newPassword, recoveryCode,} = newPasswordRecoveryInputModel
        const passwordRecovery = await passwordRecoveryRepository.getByCode(recoveryCode)

        if (passwordRecovery.expirationDate < new Date().getTime()) {
            throw new UnprocessableEntity('The password recovery code is expired');
        }
        const newPasswordHash = await this._generatePasswordHash(newPassword)
        await userRepository.setNewPassword(passwordRecovery.userId, newPasswordHash)

        return passwordRecovery;
    }
}

export const authService = new AuthService();
