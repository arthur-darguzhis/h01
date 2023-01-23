import {UserType} from "../domain/types/UserType";
import {usersCollection} from "../db";

export const userRepository = {
    async createUser(newUser: UserType): Promise<UserType> {
        await usersCollection.insertOne(newUser);
        return newUser
    }
}
