import {Router} from "express";
import {RequestWithBody} from "./types/RequestTypes";
import {UserInputModel} from "./inputModels/UserInputModel";
import {checkErrorsInRequestDataMiddleware} from "../middlewares/checkErrorsInRequestDataMiddleware";
import {authGuardMiddleware} from "../middlewares/authGuardMiddleware";
import {validateUser} from "../middlewares/validators/validateUser";
import {usersService} from "../domain/service/users-service";
import {userQueryRepository} from "../queryRepository/userQueryRepository";
import {HTTP_STATUSES} from "./types/HttpStatuses";
import {UserViewModel} from "../queryRepository/types/User/UserViewModel";

export const usersRouter = Router({})

usersRouter.post('/',
    authGuardMiddleware,
    validateUser.body.login,
    validateUser.body.email,
    validateUser.body.password,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<UserInputModel>, res) => {
        const newUserId = await usersService.createUser(req.body)
        const newUser = await userQueryRepository.findUser(newUserId) as UserViewModel
        res.status(HTTP_STATUSES.CREATED_201).json(newUser)
    })
