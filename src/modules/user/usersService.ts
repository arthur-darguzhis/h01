import {UserInputModel} from "./types/UserInputModel";
import {User} from "./types/UserType";
import {ObjectId} from "mongodb";
import {userRepository} from "./repository/user.MongoDbRepository";
import bcrypt from 'bcrypt'
import {v4 as uuidv4} from "uuid";
import add from "date-fns/add"
import {emailsManager} from "../../common/managers/email/emailsManager";
import {UnprocessableEntity} from "../../common/exceptions/UnprocessableEntity";
import {emailConfirmationRepository} from "../auth/emailConfirmation/repository/emailConfirmation.MongoDbRepository";
import {EmailConfirmationType} from "../auth/emailConfirmation/types/EmailConfirmationType";

class UsersService {
    async createUser(userInputModel: UserInputModel): Promise<User> {
        const passwordHash = await this._generatePasswordHash(userInputModel.password)

        const newUser = new User(
            userInputModel.login,
            passwordHash,
            userInputModel.email,
            true,
        )

        return await userRepository.add(newUser);
    }

    async findUserById(id: string): Promise<User | null> {
        return userRepository.find(id);
    }

    async deleteUser(id: string): Promise<boolean> {
        return userRepository.delete(id)
    }

    async checkCredentials(loginOrEmail: string, password: string): Promise<User | false> {
        const user = await userRepository.findByLoginOrEmail(loginOrEmail)
        if (!user) return false;

        const areCredentialValid = await bcrypt.compare(password, user.passwordHash);
        if (!areCredentialValid) return false;

        return user;
    }

    async _generatePasswordHash(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    async confirmEmail(code: string): Promise<true | never> {
        const emailConfirmation = await emailConfirmationRepository.findByConfirmationCode(code);
        if (!emailConfirmation) {
            throw new UnprocessableEntity('The confirmation code is invalid')
        }

        const user = await userRepository.get(emailConfirmation.userId);

        if (user.isActive || emailConfirmation.isConfirmed) {
            throw new UnprocessableEntity('The email is already confirmed')
        }

        if (emailConfirmation.expirationDate < new Date().getTime()) {
            throw new UnprocessableEntity('The confirmation code is expired');
        }

        await this.activateUser(user._id);
        await this.confirmEmailConfirmationCode(emailConfirmation._id)

        //TODO возможно эта предупреждение нужно, но вообще хочется подумать стоит ли возвращать true | false или лучше кидать исключения?
        //if (!result) throw new UnprocessableEntity('User confirmation failed')
        return true;
    }

    async resendConfirmEmail(email: string): Promise<true | never> {
        const user = await userRepository.findByLoginOrEmail(email);
        if (!user) {
            throw new UnprocessableEntity('The email is not in the database confirmed')
        }
        const emailConfirmation = await emailConfirmationRepository.getByUserId(user._id);
        if (user.isActive || emailConfirmation.isConfirmed) {
            throw new UnprocessableEntity('The email is already confirmed')
        }

        const newEmailConfirmation: EmailConfirmationType = {
            _id: new ObjectId().toString(),
            userId: user._id,
            confirmationCode: uuidv4(),
            expirationDate: add(new Date(), {hours: 10, minutes: 3}).getTime(),
            sendingTime: new Date().getTime(),
            isConfirmed: false,
        }

        await emailConfirmationRepository.delete(emailConfirmation._id);
        await emailConfirmationRepository.add(newEmailConfirmation);

        emailsManager.sendRegistrationConfirmationLetter(user, newEmailConfirmation)

        return true;
    }

    async confirmEmailConfirmationCode(emailConfirmationId: string): Promise<boolean> {
        return await emailConfirmationRepository.update(emailConfirmationId, {isConfirmed: true})
    }

    async activateUser(userId: string): Promise<boolean> {
        return await userRepository.activeUser(userId)
    }
}

export const usersService = new UsersService()