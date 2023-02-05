import {UserViewModel} from "./types/UserViewModel";
import {dbConnection} from "../../db";
import {UserType} from "./types/UserType";
import {UserFilterType} from "./types/UserFilterType";
import {MeViewModel} from "./types/MeViewModel";
import {mapUserToMeViewModel, mapUserToViewModel} from "./user.mapper";
import {PaginatorResponse} from "../auth/types/paginator/PaginatorResponse";
import {UserPaginatorParams} from "./types/UserPaginatorParams";
import {QueryMongoDbRepository} from "../../common/repositories/QueryMongoDbRepository";

class UserQueryRepository extends QueryMongoDbRepository<UserType, UserViewModel>{
    async findMe(id: string): Promise<MeViewModel | null> {
        const user = await this.collection.findOne({_id: id})
        return user ? mapUserToMeViewModel(user) : null;
    }

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

        const count = await this.collection.countDocuments(filter)
        const howManySkip = (pageNumber - 1) * pageSize;
        const users = await this.collection.find(filter).sort(sortBy, direction).skip(howManySkip).limit(pageSize).toArray()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            "items": users.map(mapUserToViewModel)
        }
    }

    async findByLogin(login: string): Promise<UserType | null> {
        return await this.collection.findOne({login: login})
    }

    async findByEmail(email: string): Promise<UserType | null> {
        return await this.collection.findOne({email: email})
    }
}

export const userQueryRepository = new UserQueryRepository(dbConnection, 'users', mapUserToViewModel)
