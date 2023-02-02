import {UserInputModel} from "../../routes/inputModels/UserInputModel";
import {userRepository} from "../user/user.MongoDbRepository";
import {EntityAlreadyExists} from "../../domain/exceptions/EntityAlreadyExists";
import {UserType} from "../../domain/types/UserType";
import {emailsManager} from "../../managers/emailsManager";
import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";
import add from "date-fns/add";
import bcrypt from "bcrypt";
import {EmailConfirmationType} from "../emailConfirmation/types/EmailConfirmationType";
import {emailConfirmationRepository} from "../emailConfirmation/emailConfirmation.MongoDbRepository";

export const authService = {
    async registerNewUser(userInputModel: UserInputModel): Promise<[user: UserType, emailConfirmation: EmailConfirmationType] | never> {
        const isUserExists = await userRepository.isUserExists(userInputModel.email, userInputModel.login);
        if (isUserExists) {
            throw new EntityAlreadyExists('User with the same "email" or "login" is already exists')
        }
        const passwordHash = await this._generatePasswordHash(userInputModel.password)

        const newUser: UserType = {
            _id: new ObjectId().toString(),
            login: userInputModel.login,
            password: passwordHash,
            email: userInputModel.email,
            createdAt: new Date().toISOString(),
            isActive: false,
        }

        const emailConfirmation: EmailConfirmationType = {
            _id: new ObjectId().toString(),
            userId: newUser._id,
            confirmationCode: uuidv4(),
            expirationDate: add(new Date(), {hours: 10, minutes: 3}).getTime(),
            sendingTime: new Date().getTime(),
            isConfirmed: false,
        }

        await userRepository.addUser(newUser);
        await emailConfirmationRepository.addEmailConfirmation(emailConfirmation)
        await emailsManager.sendRegistrationConfirmationLetter(newUser, emailConfirmation)
        return [newUser, emailConfirmation];
    },

    async _generatePasswordHash(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    },
}
