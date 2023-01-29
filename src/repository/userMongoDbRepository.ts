import {UserEmailConfirmation, UserType} from "../domain/types/UserType";
import {usersCollection} from "../db";
import {EntityNotFound} from "../domain/exceptions/EntityNotFound";

export const userRepository = {
    async addUser(newUser: UserType): Promise<UserType> {
        await usersCollection.insertOne(newUser);
        return newUser
    },

    async getUser(id: string): Promise<UserType | never> {
        const user = await usersCollection.findOne({_id: id});
        if (!user) throw new EntityNotFound(`User with id: ${id} is not exists`)
        return user
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
    },

    async getUserByConfirmationCode(code: string): Promise<UserType | never> {
        const user = await usersCollection.findOne({"emailConfirmation.confirmationCode": code});
        if (!user) throw new EntityNotFound(`User with confirmationCode: ${code} is not exists`)
        return user;
    },

    async saveConfirmedUser(userId: string, emailConfirmation: UserEmailConfirmation): Promise<boolean> {
        const result = await usersCollection.updateOne({_id: userId}, {
            $set: {
                isActive: true,
                emailConfirmation: emailConfirmation,
            }
        })
        return result.matchedCount === 1;
    },

    async getUserByEmail(email: string): Promise<UserType | never> {
        const user = await usersCollection.findOne({email: email})
        if (!user) throw new EntityNotFound(`User with email: ${email} is not exists`)
        return user
    },

    async updateUser(userId: string, updateFilter: object): Promise<boolean> {
        const result = await usersCollection.updateOne({_id: userId}, {$set: updateFilter})
        return result.matchedCount === 1;
    }
}
