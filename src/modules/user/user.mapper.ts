import {UserType} from "./types/UserType";
import {UserViewModel} from "./types/UserViewModel";
import {MeViewModel} from "./types/MeViewModel";

export const mapUserToViewModel = (user: UserType): UserViewModel => {
    return {
        id: user._id,
        login: user.login,
        email: user.email,
        createdAt: user.createdAt
    }
}

export const mapUserToMeViewModel = (user: UserType): MeViewModel => {
    return {
        email: user.email,
        login: user.login,
        userId: user._id
    }
}
