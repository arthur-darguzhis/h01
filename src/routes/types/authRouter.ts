import {Router} from "express";
import {RequestWithBody} from "./RequestTypes";
import {usersService} from "../../domain/service/users-service";
import {HTTP_STATUSES} from "./HttpStatuses";
import {LoginInputModel} from "../inputModels/LoginInputModel";
import {checkErrorsInRequestDataMiddleware} from "../../middlewares/checkErrorsInRequestDataMiddleware";
import {validateLogin} from "../../middlewares/validators/validateLogin";

export const authRouter = Router({});

authRouter.post('/login',
    validateLogin.body.loginOrEmail,
    validateLogin.body.password,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<LoginInputModel>, res) => {

        const areCredentialsCorrect = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password)

        if(areCredentialsCorrect){
            return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        }

        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    })
