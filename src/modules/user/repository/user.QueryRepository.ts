import {UserViewModel} from "../types/UserViewModel";
import {MeViewModel} from "../types/MeViewModel";
import {mapUserToMeViewModel, mapUserToViewModel} from "../user.mapper";
import {PaginatorResponse} from "../../auth/types/paginator/PaginatorResponse";
import {UserPaginatorParams} from "../types/UserPaginatorParams";
import {UserModel} from "../model/UserModel";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";
import {injectable} from "inversify";

@injectable()
export class UserQueryRepository {
    async find(id: string): Promise<UserViewModel | null> {
        const user = await UserModel.findOne({_id: id});
        return user ? mapUserToViewModel(user) : null
    }

    async get(id: string): Promise<UserViewModel | never> {
        const user = await UserModel.findOne({_id: id});
        if (!user) throw new EntityNotFound(`User with ID: ${id} is not exists`)
        return mapUserToViewModel(user)
    }

    async findMe(id: string): Promise<MeViewModel | null> {
        const user = await UserModel.findOne({_id: id})
        return user ? mapUserToMeViewModel(user) : null;
    }

    async findUsers(userPaginatorParams: UserPaginatorParams): Promise<PaginatorResponse<UserViewModel>> {
        const {searchEmailTerm, searchLoginTerm, sortBy, sortDirection} = userPaginatorParams
        const pageSize = +userPaginatorParams.pageSize
        const pageNumber = +userPaginatorParams.pageNumber
        const filter: { "$or"?: Object[] } = {};

        if (searchLoginTerm) {
            const loginFilter = {"login": {'$regex': searchLoginTerm, '$options': 'i'}}
            filter["$or"] ? filter["$or"]?.push(loginFilter) : filter["$or"] = [loginFilter]
        }

        if (searchEmailTerm) {
            const emailFilter = {"email": {'$regex': searchEmailTerm, '$options': 'i'}}
            filter["$or"] ? filter["$or"]?.push(emailFilter) : filter["$or"] = [emailFilter]
        }

        const direction = sortDirection === 'asc' ? 1 : -1;

        const count = await UserModel.countDocuments(filter)
        const howManySkip = (pageNumber - 1) * pageSize;
        const users = await UserModel.find(filter).sort({[sortBy]: direction}).skip(howManySkip).limit(pageSize).lean()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            "items": users.map(mapUserToViewModel)
        }
    }
}
