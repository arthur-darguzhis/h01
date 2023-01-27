import {UserType} from "../domain/types/UserType";
import {usersCollection} from "../db";

export const userRepository = {
    async addUser(newUser: UserType): Promise<UserType> {
        await usersCollection.insertOne(newUser);
        return newUser
    },

    async findUser(id: string): Promise<UserType | null> {
        return await usersCollection.findOne({_id: id});
    },

    async findByLoginOrEmail(loginOrEmail: string): Promise<UserType | null> {
        return await usersCollection.findOne({
            $or: [
                {login: loginOrEmail},
                {email: loginOrEmail}
            ]
        })
    },

    async deleteUser(id: string): Promise<boolean> {
        const result = await usersCollection.deleteOne({_id: id})
        return result.deletedCount === 1
    },

    async deleteAllUsers(): Promise<void> {
        await usersCollection.deleteMany({})
    },

    async isUserExists(email: string, login: string): Promise<boolean> {
        const user = await usersCollection.findOne({
            $or: [
                {email: email},
                {login: login}
            ]
        })
        return !!user;
    }
}
