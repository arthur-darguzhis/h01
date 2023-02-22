import {injectable} from "inversify";
import {UsersService} from "./usersService";
import {UserQueryRepository} from "./repository/user.QueryRepository";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../../common/presentationLayer/types/RequestTypes";
import {UserInputModel} from "./types/UserInputModel";
import {Response} from "express";
import {User} from "./types/UserType";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {mapUserToViewModel} from "./user.mapper";
import {UserPaginatorParams} from "./types/UserPaginatorParams";
import {PaginatorResponse} from "../auth/types/paginator/PaginatorResponse";
import {UserViewModel} from "./types/UserViewModel";

@injectable()
export class UsersController {
    constructor(
        protected userService: UsersService,
        protected userQueryRepository: UserQueryRepository
    ) {
    }

    async createUser(req: RequestWithBody<UserInputModel>, res: Response) {
        const newUser: User = await this.userService.createUser(req.body)
        res.status(HTTP_STATUSES.CREATED_201).json(mapUserToViewModel(newUser))
    }

    async deleteUser(req: RequestWithParams<{ id: string }>, res: Response) {
        const isUserDeleted = await this.userService.deleteUser(req.params.id)
        if (!isUserDeleted) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async getPaginatedUserList(req: RequestWithQuery<UserPaginatorParams>, res: Response<PaginatorResponse<UserViewModel>>) {
        const paginatedUserList = await this.userQueryRepository.findUsers(req.query)
        res.status(HTTP_STATUSES.OK_200).json(paginatedUserList)
    }
}
