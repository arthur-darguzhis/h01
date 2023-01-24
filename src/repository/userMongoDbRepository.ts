import {UserType} from "../domain/types/UserType";
import {usersCollection} from "../db";
import {ObjectId} from "mongodb";

export const userRepository = {
    async createUser(newUser: UserType): Promise<UserType> {
        await usersCollection.insertOne(newUser);
        return newUser
    },

    async deleteUser(id: string): Promise<boolean> {
        const result = await usersCollection.deleteOne({_id: new ObjectId(id).toString()})
        return result.deletedCount === 1
    },

    async deleteAllUsers(): Promise<void> {
        await usersCollection.deleteMany({})
    },

    async findByLoginOrEmail(loginOrEmail: string): Promise<UserType | null> {
        return await usersCollection.findOne({
            $or: [
                {login: loginOrEmail},
                {email: loginOrEmail}
            ]
        })
    }
}
