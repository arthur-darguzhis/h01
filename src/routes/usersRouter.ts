import {Response, Router} from "express";
import {RequestWithBody, RequestWithParams, RequestWithQuery} from "./types/RequestTypes";
import {UserInputModel} from "./inputModels/UserInputModel";
import {checkErrorsInRequestDataMiddleware} from "../middlewares/checkErrorsInRequestDataMiddleware";
import {authGuardMiddleware} from "../middlewares/authGuardMiddleware";
import {validateUser} from "../middlewares/validators/validateUser";
import {usersService} from "../domain/service/users-service";
import {userQueryRepository} from "../queryRepository/userQueryRepository";
import {HTTP_STATUSES} from "./types/HttpStatuses";
import {UserViewModel} from "../queryRepository/types/User/UserViewModel";
import {validatePaginator} from "../middlewares/validators/validatePaginator";
import {UserPaginatorType} from "../queryRepository/types/User/UserPaginatorType";

export const usersRouter = Router({})

usersRouter.post('/',
    authGuardMiddleware,
    validateUser.body.login,
    validateUser.body.email,
    validateUser.body.password,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<UserInputModel>, res) => {
        const newUserId = await usersService.createUser(req.body, true)
        const newUser = await userQueryRepository.findUser(newUserId) as UserViewModel
        res.status(HTTP_STATUSES.CREATED_201).json(newUser)
    })

usersRouter.delete('/:id', authGuardMiddleware,
    async (req: RequestWithParams<{ id: string }>, res) => {
        const isUserDeleted = await usersService.deleteUser(req.params.id)
        if (!isUserDeleted) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

usersRouter.get('/',
    authGuardMiddleware,
    validateUser.query.searchLoginTerm,
    validateUser.query.searchEmailTerm,
    validateUser.query.sortBy,
    validateUser.query.sortDirection,
    validatePaginator.pageSize,
    validatePaginator.pageNumber,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithQuery<{
               searchLoginTerm: string,
               searchEmailTerm: string,
               sortBy: string,
               sortDirection: string,
               pageSize: string,
               pageNumber: string
           }>,
           res: Response<UserPaginatorType>) => {

        const {searchLoginTerm, searchEmailTerm, sortBy, sortDirection, pageSize, pageNumber} = req.query
        const users = await userQueryRepository.findUsers(searchLoginTerm, searchEmailTerm, sortBy, sortDirection, +pageSize, +pageNumber)

        res.status(HTTP_STATUSES.OK_200).json(users)
    })

