import {Request, Response, Router} from "express";
import {RequestWithBody} from "./types/RequestTypes";
import {usersService} from "../domain/service/users-service";
import {HTTP_STATUSES} from "./types/HttpStatuses";
import {LoginInputModel} from "./inputModels/LoginInputModel";
import {checkErrorsInRequestDataMiddleware} from "../middlewares/checkErrorsInRequestDataMiddleware";
import {validateLogin} from "../middlewares/validators/validateLogin";
import {jwtService} from "../application/jwt-service";
import {jwtAuthGuardMiddleware} from "../middlewares/jwtAuthGuardMiddleware";
import {userQueryRepository} from "../modules/user/user.QueryRepository";
import {LoginSuccessViewModel} from "./types/apiError/LoginSuccessViewModel";
import {UserInputModel} from "./inputModels/UserInputModel";
import {EntityAlreadyExists} from "../domain/exceptions/EntityAlreadyExists";
import {validateUser} from "../middlewares/validators/validateUser";
import {APIErrorResultType} from "./types/apiError/APIErrorResultType";
import {MailIsNotSent} from "../domain/exceptions/MailIsNotSent";
import {RegistrationConfirmationCodeModel} from "./types/RegistrationConfirmationCodeModel";
import {jwtRefreshGuardMiddleware} from "../middlewares/jwtRefreshGuardMiddleware";
import {UnprocessableEntity} from "../domain/exceptions/UnprocessableEntity";

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
            if (err instanceof UnprocessableEntity) {
                const apiErrorResult: APIErrorResultType = {
                    errorsMessages: [{
                        field: 'email',
                        message: err.message
                    }]
                }
                return res.status(HTTP_STATUSES.BAD_REQUEST_400).json(apiErrorResult)
            } else {

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

        const authToken = jwtService.createAuthJWT(user);
        const refreshToken = jwtService.createRefreshJWT(user)
        const loginSuccessViewModel: LoginSuccessViewModel = {
            "accessToken": authToken
        }

        res.status(HTTP_STATUSES.OK_200)
            .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true, maxAge: 20 * 1000})
            .json(loginSuccessViewModel)
    })

authRouter.post('/refresh-token', jwtRefreshGuardMiddleware, async (req, res) => {
    await jwtService.addRefreshJWTtoBlackList(req.user!, req.cookies.refreshToken);
    const authToken = jwtService.createAuthJWT(req.user!);
    const refreshToken = jwtService.createRefreshJWT(req.user!)
    const loginSuccessViewModel: LoginSuccessViewModel = {
        "accessToken": authToken
    }
    res.status(HTTP_STATUSES.OK_200)
        .cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            maxAge: 20 * 1000
        })
        .json(loginSuccessViewModel)
})

authRouter.post('/logout',
    jwtRefreshGuardMiddleware,
    async (req: Request, res: Response) => {
        await jwtService.addRefreshJWTtoBlackList(req.user!, req.cookies.refreshToken);
        res.clearCookie('refreshToken').sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.get('/me', jwtAuthGuardMiddleware,
    async (req: Request, res: Response) => {
        const user = await userQueryRepository.findMe(req.user!._id);
        res.status(HTTP_STATUSES.OK_200).json(user)
    })
