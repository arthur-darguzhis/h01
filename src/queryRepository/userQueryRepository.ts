import {UserViewModel} from "./types/User/UserViewModel";
import {usersCollection} from "../db";
import {ObjectId} from "mongodb";
import {UserType} from "../domain/types/UserType";
import {UserPaginatorType} from "./types/User/UserPaginatorType";
import {UserFilterType} from "./types/User/UserFilterType";

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
    },

    async findUsers(
        searchLoginTerm: string | null,
        searchEmailTerm: string | null,
        sortBy: string,
        sortDirection: string,
        pageSize: number,
        pageNumber: number
    ): Promise<UserPaginatorType> {

        const filter: UserFilterType = {};

        if (searchLoginTerm) {
            const loginFilter = {"login": {'$regex': searchLoginTerm, '$options': 'i'}}
            filter["$or"] ? filter["$or"]?.push(loginFilter) : filter["$or"] = [loginFilter]
        }

        if (searchEmailTerm) {
            const emailFilter = {"email": {'$regex': searchEmailTerm, '$options': 'i'}}
            filter["$or"] ? filter["$or"]?.push(emailFilter) : filter["$or"] = [emailFilter]
        }

        const direction = sortDirection === 'asc' ? 1 : -1;

        const count = await usersCollection.countDocuments(filter)
        const howManySkip = (pageNumber - 1) * pageSize;
        const users = await usersCollection.find(filter).sort(sortBy, direction).skip(howManySkip).limit(pageSize).toArray()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            "items": users.map(_mapUserToViewModel)
        }
    }
}
