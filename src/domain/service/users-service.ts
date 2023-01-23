import {UserInputModel} from "../../routes/inputModels/UserInputModel";
import {UserType} from "../types/UserType";
import {ObjectId} from "mongodb";
import {userRepository} from "../../repository/userMongoDbRepository";
import {blogRepository} from "../../repository/blogMongoDbRepository";

export const usersService = {
    async createUser(userInputModel: UserInputModel): Promise<string> {
        const newUser: UserType = {
            _id: new ObjectId().toString(),
            login: userInputModel.login,
            password: userInputModel.password,
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
}
