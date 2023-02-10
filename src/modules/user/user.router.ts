import {Response, Router} from "express";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "../../common/presentationLayer/types/RequestTypes";
import {UserInputModel} from "./types/UserInputModel";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {authGuardMiddleware} from "../auth/middlewares/authGuardMiddleware";
import {validateUser} from "./middlewares/validateUser";
import {usersService} from "./users-service";
import {userQueryRepository} from "./repository/user.QueryRepository";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {validatePaginator} from "../../common/middlewares/validatePaginator";
import {UserType} from "./types/UserType";
import {mapUserToViewModel} from "./user.mapper";
import {PaginatorResponse} from "../auth/types/paginator/PaginatorResponse";
import {UserViewModel} from "./types/UserViewModel";
import {UserPaginatorParams} from "./types/UserPaginatorParams";

export const userRouter = Router({})

userRouter.post('/',
    authGuardMiddleware,
    validateUser.body.login,
    validateUser.body.email,
    validateUser.body.password,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<UserInputModel>, res) => {
        const newUser: UserType = await usersService.createUser(req.body)
        res.status(HTTP_STATUSES.CREATED_201).json(mapUserToViewModel(newUser))
    })

userRouter.delete('/:id', authGuardMiddleware,
    async (req: RequestWithParams<{ id: string }>, res) => {
        const isUserDeleted = await usersService.deleteUser(req.params.id)
        if (!isUserDeleted) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

userRouter.get('/',
    authGuardMiddleware,
    validateUser.query.searchLoginTerm,
    validateUser.query.searchEmailTerm,
    validateUser.query.sortBy,
    validateUser.query.sortDirection,
    validatePaginator.pageSize,
    validatePaginator.pageNumber,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithQuery<UserPaginatorParams>, res: Response<PaginatorResponse<UserViewModel>>) => {
        const paginatedUserList = await userQueryRepository.findUsers(req.query)
        res.status(HTTP_STATUSES.OK_200).json(paginatedUserList)
    })
