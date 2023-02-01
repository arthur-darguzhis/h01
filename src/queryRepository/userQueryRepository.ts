import {UserViewModel} from "./types/User/UserViewModel";
import {usersCollection} from "../db";
import {UserType} from "../domain/types/UserType";
import {UserFilterType} from "./types/User/UserFilterType";
import {MeViewModel} from "./types/User/MeViewModel";
import {mapUserToMeViewModel, mapUserToViewModel} from "../modules/user/user.mapper";
import {PaginatorResponse} from "../routes/types/paginator/PaginatorResponse";
import {UserPaginatorParams} from "../routes/types/paginator/UserPaginatorParams";

export const userQueryRepository = {
    async findUser(id: string): Promise<UserViewModel | null> {
        const user = await usersCollection.findOne({_id: id})
        return user ? mapUserToViewModel(user) : null
    },

    async findMe(id: string): Promise<MeViewModel | null> {
        const user = await usersCollection.findOne({_id: id})
        return user ? mapUserToMeViewModel(user) : null;
    },

    async findUsers(userPaginatorParams: UserPaginatorParams): Promise<PaginatorResponse<UserViewModel>> {
        const {searchEmailTerm, searchLoginTerm, sortBy, sortDirection} = userPaginatorParams
        const pageSize = +userPaginatorParams.pageSize
        const pageNumber = +userPaginatorParams.pageNumber
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
            "items": users.map(mapUserToViewModel)
        }
    },
    async findByLogin(login: string): Promise<UserType | null> {
        return await usersCollection.findOne({login: login})
    },

    async findByEmail(email: string): Promise<UserType | null> {
        return await usersCollection.findOne({email: email})
    }
}
