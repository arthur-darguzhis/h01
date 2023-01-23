import {UserViewModel} from "./types/User/UserViewModel";
import {usersCollection} from "../db";
import {ObjectId} from "mongodb";
import {UserType} from "../domain/types/UserType";

const _mapUserToViewModel = (user: UserType): UserViewModel => {
    return {
        id: user._id,
        login: user.login,
        email: user.email,
        createdAt: user.createdAt
    }
}

export const userQueryRepository = {
    async findUser(id: string): Promise<UserViewModel | null> {
        const user = await usersCollection.findOne({_id: new ObjectId(id).toString()})
        return user ? _mapUserToViewModel(user) : null
    }
}
