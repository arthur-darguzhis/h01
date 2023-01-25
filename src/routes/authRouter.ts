import {Request, Response, Router} from "express";
import {RequestWithBody} from "./types/RequestTypes";
import {usersService} from "../domain/service/users-service";
import {HTTP_STATUSES} from "./types/HttpStatuses";
import {LoginInputModel} from "./inputModels/LoginInputModel";
import {checkErrorsInRequestDataMiddleware} from "../middlewares/checkErrorsInRequestDataMiddleware";
import {validateLogin} from "../middlewares/validators/validateLogin";
import {jwtService} from "../application/jwt-service";
import {jwtAuthGuardMiddleware} from "../middlewares/jwtAuthGuardMiddleware";
import {userQueryRepository} from "../queryRepository/userQueryRepository";
import {LoginSuccessViewModel} from "./types/apiError/LoginSuccessViewModel";

export const authRouter = Router({});

authRouter.post('/login',
    validateLogin.body.loginOrEmail,
    validateLogin.body.password,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<LoginInputModel>, res) => {
        const user = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password)

        if (!user) {
            return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        }

        const token = await jwtService.createJWT(user)
        const loginSuccessViewModel: LoginSuccessViewModel = {
            "accessToken": token
        }
        res.status(HTTP_STATUSES.OK_200).json(loginSuccessViewModel)
    })

authRouter.get('/me', jwtAuthGuardMiddleware,
    async (req: Request, res: Response) => {
        const user = await userQueryRepository.findMe(req.user!._id);
        res.status(HTTP_STATUSES.OK_200).json(user)
    })
