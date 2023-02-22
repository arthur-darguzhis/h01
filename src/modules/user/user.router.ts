import {Router} from "express";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {authGuardMiddleware} from "../auth/middlewares/authGuardMiddleware";
import {validateUser} from "./middlewares/validateUser";
import {validatePaginator} from "../../common/middlewares/validatePaginator";
import {container} from "../../common/compositon-root";
import {UsersController} from "./user.controller";

export const userRouter = Router({})

const usersController = container.resolve(UsersController);

userRouter.post('/',
    authGuardMiddleware,
    validateUser.body.login,
    validateUser.body.email,
    validateUser.body.password,
    checkErrorsInRequestDataMiddleware,
    usersController.createUser.bind(usersController))

userRouter.delete('/:id', authGuardMiddleware,
    usersController.deleteUser.bind(usersController))

userRouter.get('/',
    authGuardMiddleware,
    validateUser.query.searchLoginTerm,
    validateUser.query.searchEmailTerm,
    validateUser.query.sortBy,
    validateUser.query.sortDirection,
    validatePaginator.pageSize,
    validatePaginator.pageNumber,
    checkErrorsInRequestDataMiddleware,
    usersController.getPaginatedUserList.bind(usersController))
