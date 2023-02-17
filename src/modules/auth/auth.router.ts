import {Request, Response, Router} from "express";
import {RequestWithBody} from "../../common/presentationLayer/types/RequestTypes";
import {usersService} from "../user/usersService";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {LoginInputModel} from "./types/LoginInputModel";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {validateLogin} from "./middlewares/validateLogin";
import {jwtService} from "./jwt/jwtService";
import {jwtAuthGuardMiddleware} from "./middlewares/jwtAuthGuardMiddleware";
import {userQueryRepository} from "../user/repository/user.QueryRepository";
import {LoginSuccessViewModel} from "./types/LoginSuccessViewModel";
import {UserInputModel} from "../user/types/UserInputModel";
import {validateUser} from "../user/middlewares/validateUser";
import {RegistrationConfirmationCodeModel} from "./types/RegistrationConfirmationCodeModel";
import {jwtRefreshGuardMiddleware} from "./middlewares/jwtRefreshGuardMiddleware";
import {authService} from "./authService";
import {securityService} from "../security/securityService";
import {UserActiveSession} from "../security/types/UserActiveSessionType";
import {UserActiveSessionUpdateModelType} from "../security/types/UserActiveSessionUpdateModelType";
import {checkRateLimiterMiddleware, setRateLimiter} from "../../common/middlewares/rateLimiterMiddleware";
import {NewPasswordRecoveryInputModel} from "./types/NewPasswordRecoveryInputModel";
import {PasswordRecoveryInputModel} from "./types/PasswordRecoveryInputModel";
import {body} from "express-validator";

export const authRouter = Router({});

class AuthController {
    async registerNewUser(req: RequestWithBody<UserInputModel>, res: Response) {
        await authService.registerNewUser(req.body);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }

    async userConfirmEmail(req: RequestWithBody<RegistrationConfirmationCodeModel>, res: Response) {
        await usersService.confirmEmail(req.body.code);
        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async userResentConfirmEmail(req: RequestWithBody<{ email: string }>, res: Response) {
        await usersService.resendConfirmEmail(req.body.email)
        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async userLogin(req: RequestWithBody<LoginInputModel>, res: Response<LoginSuccessViewModel>) {
        const user = await usersService.checkCredentials(req.body.loginOrEmail, req.body.password)
        if (!user || !user.isActive) {
            return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
        }

        const authToken = jwtService.createAuthJWT(user);
        const refreshToken = jwtService.createRefreshJWT(user)
        const decodedRefreshToken = jwtService.decodeRefreshJWT(refreshToken);
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        const userActiveSession = new UserActiveSession(
            decodedRefreshToken.iat!,
            decodedRefreshToken.exp!,
            decodedRefreshToken.deviceId,
            ip as string,
            req.headers["user-agent"] || '',
            user._id,
        )
        await securityService.registerUserActiveSession(userActiveSession)

        res.status(HTTP_STATUSES.OK_200)
            .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true, maxAge: 20 * 1000})
            .json({"accessToken": authToken})
    }

    async refreshToken(req: Request, res: Response<LoginSuccessViewModel>) {
        const deviceId = jwtService.getDeviceIdFromRefreshToken(req.cookies.refreshToken);

        const user = req.user!
        const authToken = jwtService.createAuthJWT(user);
        const refreshToken = jwtService.createRefreshJWT(user, deviceId)
        const decodedRefreshToken = jwtService.decodeRefreshJWT(refreshToken);

        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

        const userActiveSessionUpdateModel: UserActiveSessionUpdateModelType = {
            issuedAt: decodedRefreshToken?.iat,
            expireAt: decodedRefreshToken?.exp,
            ip: ip as string,
            deviceName: req.headers["user-agent"] || '',
        }

        await securityService.updateUserActiveSession(deviceId, userActiveSessionUpdateModel)

        res.status(HTTP_STATUSES.OK_200)
            .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true, maxAge: 20 * 1000})
            .json({"accessToken": authToken})
    }

    async userLogout(req: Request, res: Response) {
        await authService.removeUserSession(req.cookies.refreshToken)
        res.clearCookie('refreshToken').sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async userRequestPasswordRecovery(req: RequestWithBody<PasswordRecoveryInputModel>, res: Response) {
        try {
            await authService.passwordRecovery(req.body)
        } catch (err) {
            console.log('silent exception for prevent user\'s email detection');
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async userSetNewPassword(req: RequestWithBody<NewPasswordRecoveryInputModel>, res: Response) {
        await authService.setNewPassword(req.body)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async getInfoAboutCurrentUsear(req: Request, res: Response) {
        const user = await userQueryRepository.findMe(req.user!._id);
        res.status(HTTP_STATUSES.OK_200).json(user)
    }
}

const authController = new AuthController();

authRouter.post('/registration',
    checkRateLimiterMiddleware,
    validateUser.body.email,
    validateUser.body.login,
    validateUser.body.password,
    checkErrorsInRequestDataMiddleware,
    authController.registerNewUser)

authRouter.post('/registration-confirmation',
    setRateLimiter(5, 10),
    authController.userConfirmEmail)

authRouter.post('/registration-email-resending',
    setRateLimiter(5, 10),
    validateUser.body.email,
    checkErrorsInRequestDataMiddleware,
    authController.userResentConfirmEmail)

authRouter.post('/login',
    setRateLimiter(5, 10),
    validateLogin.body.loginOrEmail,
    validateLogin.body.password,
    checkErrorsInRequestDataMiddleware,
    authController.userLogin)

authRouter.post('/refresh-token', jwtRefreshGuardMiddleware, authController.refreshToken)

authRouter.post('/logout',
    jwtRefreshGuardMiddleware,
    authController.userLogout
)

authRouter.post('/password-recovery',
    setRateLimiter(5, 10),
    validateUser.body.email,
    checkErrorsInRequestDataMiddleware,
    authController.userRequestPasswordRecovery)

authRouter.post('/new-password',
    setRateLimiter(5, 10),
    body('newPassword').trim().isLength({min: 6, max: 20}),
    body('recoveryCode').trim().isLength({min: 15}),
    checkErrorsInRequestDataMiddleware,
    authController.userSetNewPassword)

authRouter.get('/me', jwtAuthGuardMiddleware,
    authController.getInfoAboutCurrentUsear)
