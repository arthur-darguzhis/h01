import {UserInputModel} from "../../routes/inputModels/UserInputModel";
import {UserType} from "../types/UserType";
import {ObjectId} from "mongodb";
import {userRepository} from "../../repository/userMongoDbRepository";
import bcrypt from 'bcrypt'

export const usersService = {
    async createUser(userInputModel: UserInputModel): Promise<string> {
        const passwordHash = await this._generatePasswordHash(userInputModel.password)

        const newUser: UserType = {
            _id: new ObjectId().toString(),
            login: userInputModel.login,
            password: passwordHash,
            email: userInputModel.email,
            createdAt: new Date().toISOString()
        }

        const user = await userRepository.createUser(newUser);
        return user._id.toString();
    },

    async deleteUser(id: string): Promise<boolean> {
        return await userRepository.deleteUser(id)
    },

    async deleteAllUsers(): Promise<void> {
        await userRepository.deleteAllUsers()
    },

    async checkCredentials(loginOrEmail: string, password: string): Promise<boolean> {
        const user = await userRepository.findByLoginOrEmail(loginOrEmail)

        if (!user) return false;
        return bcrypt.compare(password, user.password)
    },

    async _generatePasswordHash(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    },
}
