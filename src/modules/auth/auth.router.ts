import {Request, Response, Router} from "express";
import {RequestWithBody} from "../../common/presentationLayer/types/RequestTypes";
import {usersService} from "../user/users-service";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {LoginInputModel} from "./types/LoginInputModel";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {validateLogin} from "./middlewares/validateLogin";
import {jwtService} from "../jwt/jwt-service";
import {jwtAuthGuardMiddleware} from "./middlewares/jwtAuthGuardMiddleware";
import {userQueryRepository} from "../user/user.QueryRepository";
import {LoginSuccessViewModel} from "./types/LoginSuccessViewModel";
import {UserInputModel} from "../user/types/UserInputModel";
import {validateUser} from "../user/middlewares/validateUser";
import {RegistrationConfirmationCodeModel} from "./types/RegistrationConfirmationCodeModel";
import {jwtRefreshGuardMiddleware} from "./middlewares/jwtRefreshGuardMiddleware";
import {authService} from "./auth.service";

export const authRouter = Router({});

authRouter.post('/registration',
    validateUser.body.email,
    validateUser.body.login,
    validateUser.body.password,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<UserInputModel>, res) => {
        await authService.registerNewUser(req.body);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    })

authRouter.post('/registration-confirmation', async (req: RequestWithBody<RegistrationConfirmationCodeModel>, res) => {
    await usersService.confirmEmail(req.body.code);
    return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

authRouter.post('/registration-email-resending',
    validateUser.body.email,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<{ email: string }>, res) => {
        await usersService.resendConfirmEmail(req.body.email)
        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.post('/login',
    validateLogin.body.loginOrEmail,
    validateLogin.body.password,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<LoginInputModel>, res: Response<LoginSuccessViewModel>) => {
        const user = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password)
        if (!user || !user.isActive) {
            return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        }

        const authToken = jwtService.createAuthJWT(user);
        const refreshToken = jwtService.createRefreshJWT(user)

        res.status(HTTP_STATUSES.OK_200)
            .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true, maxAge: 20 * 1000})
            .json({"accessToken": authToken})
    })

authRouter.post('/refresh-token', jwtRefreshGuardMiddleware, async (req, res: Response<LoginSuccessViewModel>) => {
    jwtService.addRefreshJWTtoBlackList(req.user!, req.cookies.refreshToken);
    const authToken = jwtService.createAuthJWT(req.user!);
    const refreshToken = jwtService.createRefreshJWT(req.user!)

    res.status(HTTP_STATUSES.OK_200)
        .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true, maxAge: 20 * 1000})
        .json({"accessToken": authToken})
})

authRouter.post('/logout',
    jwtRefreshGuardMiddleware,
    (req: Request, res: Response) => {
        jwtService.addRefreshJWTtoBlackList(req.user!, req.cookies.refreshToken);
        res.clearCookie('refreshToken').sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.get('/me', jwtAuthGuardMiddleware,
    async (req: Request, res: Response) => {
        const user = await userQueryRepository.findMe(req.user!._id);
        res.status(HTTP_STATUSES.OK_200).json(user)
    })
