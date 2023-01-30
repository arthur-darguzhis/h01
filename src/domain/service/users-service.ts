import {UserInputModel} from "../../routes/inputModels/UserInputModel";
import {UserType} from "../types/UserType";
import {ObjectId} from "mongodb";
import {userRepository} from "../../repository/userMongoDbRepository";
import bcrypt from 'bcrypt'
import {EntityAlreadyExists} from "../exceptions/EntityAlreadyExists";
import {v4 as uuidv4} from "uuid";
import add from "date-fns/add"
import {MailIsNotSent} from "../exceptions/MailIsNotSent";
import {emailsManager} from "../../managers/emailsManager";
import {UnprocessableEntity} from "../exceptions/UnprocessableEntity";

export const usersService = {
    async createUser(userInputModel: UserInputModel, isUserActive: boolean): Promise<UserType> {
        const passwordHash = await this._generatePasswordHash(userInputModel.password)

        const newUser: UserType = {
            _id: new ObjectId().toString(),
            login: userInputModel.login,
            password: passwordHash,
            email: userInputModel.email,
            createdAt: new Date().toISOString(),
            isActive: isUserActive,
            emailConfirmation: {
                confirmationCode: isUserActive ? undefined : uuidv4(),
                expirationDate: isUserActive ? undefined : add(new Date(), {hours: 10, minutes: 3}).getTime(),
                isConfirmed: isUserActive,
            }
        }

        return await userRepository.addUser(newUser);
    },

    async findUserById(id: string): Promise<UserType | null> {
        return userRepository.findUser(id);
    },

    async deleteUser(id: string): Promise<boolean> {
        return userRepository.deleteUser(id)
    },

    async deleteAllUsers(): Promise<void> {
        await userRepository.deleteAllUsers()
    },

    async checkCredentials(loginOrEmail: string, password: string): Promise<UserType | false> {
        const user = await userRepository.findByLoginOrEmail(loginOrEmail)
        if (!user) return false;

        const areCredentialValid = await bcrypt.compare(password, user.password);
        if (!areCredentialValid) return false;

        return user;
    },

    async _generatePasswordHash(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    },

    async registerUser(userInputModel: UserInputModel): Promise<true | never> {
        const isUserExists = await userRepository.isUserExists(userInputModel.email, userInputModel.login);
        if (isUserExists) {
            throw new EntityAlreadyExists('User with the same "email" or "login" is already exists')
        }

        const user: UserType = await this.createUser(userInputModel, false);
        await emailsManager.sendConfirmationLetter(user)
        // await userRepository.updateUser(user._id, {"emailConfirmation.sendingTime": new Date().getTime()})
        return true;
    },

    async confirmEmail(code: string): Promise<true | never> {
        const user = await userRepository.getUserByConfirmationCode(code);

        if (user.isActive || user.emailConfirmation.isConfirmed) {
            throw new UnprocessableEntity('The email is already confirmed')
        }

        if (user.emailConfirmation.expirationDate && user.emailConfirmation.expirationDate < new Date().getTime()) {
            throw new UnprocessableEntity('The confirmation code is expired');
        }

        user.emailConfirmation = {
            confirmationCode: undefined,
            expirationDate: undefined,
            sendingTime: undefined,
            isConfirmed: true
        };
        const result = await userRepository.saveConfirmedUser(user._id, user.emailConfirmation)
        if (!result) throw new UnprocessableEntity('User confirmation failed')
        return true;
    },

    async resendConfirmEmail(email: string): Promise<true | never> {
        const user = await userRepository.getUserByEmail(email);
        if (user.isActive || user.emailConfirmation.isConfirmed) {
            throw new UnprocessableEntity('The email is already confirmed')
        }

        if (user.emailConfirmation.expirationDate
            && user.emailConfirmation.expirationDate > new Date().getTime()
            && user.emailConfirmation.sendingTime) {

            const minutesLastResendWas = (new Date().getTime() - user.emailConfirmation.sendingTime) / 60
            if (Math.ceil(minutesLastResendWas) <= 15) {
                const tryAfterMinutes = Math.ceil(15 - minutesLastResendWas);
                throw new UnprocessableEntity(`Try to resend email in ${tryAfterMinutes} min`)
            }
        }

        user.emailConfirmation = {
            confirmationCode: uuidv4(),
            expirationDate: add(new Date(), {hours: 10, minutes: 3}).getTime(),
            sendingTime: new Date().getTime(),
            isConfirmed: false,
        }

        await userRepository.updateUser(user._id, {emailConfirmation: user.emailConfirmation});

        try {
            await emailsManager.sendConfirmationLetter(user)
        } catch (e) {
            if (e instanceof MailIsNotSent) {
                await userRepository.deleteUser(user._id);
                throw e;
            }
        }
        return true;
    }
}
