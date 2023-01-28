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
import {UserInputModel} from "./inputModels/UserInputModel";
import {EntityAlreadyExists} from "../domain/exceptions/EntityAlreadyExists";
import {validateUser} from "../middlewares/validators/validateUser";
import {APIErrorResultType} from "./types/apiError/APIErrorResultType";
import {MailIsNotSent} from "../domain/exceptions/MailIsNotSent";
import {RegistrationConfirmationCodeModel} from "./types/RegistrationConfirmationCodeModel";

export const authRouter = Router({});

authRouter.post('/registration',
    validateUser.body.email,
    validateUser.body.login,
    validateUser.body.password,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<UserInputModel>, res) => {
        try {
            await usersService.registerUser(req.body);
        } catch (err) {
            if (err instanceof EntityAlreadyExists || err instanceof MailIsNotSent) {
                const apiErrorResult: APIErrorResultType = {
                    errorsMessages: [{
                        field: 'email',
                        message: err.message
                    }]
                }
                return res.status(HTTP_STATUSES.BAD_REQUEST_400).json(apiErrorResult)
            }
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    })

authRouter.post('/registration-confirmation', async (req: RequestWithBody<RegistrationConfirmationCodeModel>, res) => {
    try {
        await usersService.confirmEmail(req.body.code);
    } catch (err) {
        //TODO Как пофиксить? по тмоу как (он не может отловить исключение класса UnprocessableEntity все думает что это Error)
        if (err instanceof Error) {
            const apiErrorResult: APIErrorResultType = {
                errorsMessages: [{
                    field: 'code',
                    message: err.message
                }]
            }
            return res.status(HTTP_STATUSES.BAD_REQUEST_400).json(apiErrorResult)
        }
    }
    return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

authRouter.post('/registration-email-resending',
    validateUser.body.email,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<{ email: string }>, res) => {
        try {
            await usersService.resendConfirmEmail(req.body.email)
        } catch (err) {
            if (err instanceof Error) {
                const apiErrorResult: APIErrorResultType = {
                    errorsMessages: [{
                        field: 'email',
                        message: err.message
                    }]
                }
                return res.status(HTTP_STATUSES.BAD_REQUEST_400).json(apiErrorResult)
            }
        }
        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.post('/login',
    validateLogin.body.loginOrEmail,
    validateLogin.body.password,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<LoginInputModel>, res) => {
        const user = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password)

        if (!user || !user.emailConfirmation.isConfirmed || !user.isActive) {
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
