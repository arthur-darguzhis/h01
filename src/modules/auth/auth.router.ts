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
import {securityService} from "../security/security.service";
import {UserActiveSessionType} from "../security/types/UserActiveSessionType";
import {ObjectId} from "mongodb";
import {UserActiveSessionUpdateModelType} from "../security/types/UserActiveSessionUpdateModelType";
import {checkRateLimiterMiddleware, setRateLimiter} from "../../common/middlewares/rateLimiterMiddleware";

export const authRouter = Router({});

authRouter.post('/registration',
    checkRateLimiterMiddleware,
    validateUser.body.email,
    validateUser.body.login,
    validateUser.body.password,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<UserInputModel>, res) => {
        await authService.registerNewUser(req.body);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    })

authRouter.post('/registration-confirmation',
    setRateLimiter(5, 10),
    async (req: RequestWithBody<RegistrationConfirmationCodeModel>, res) => {
        await usersService.confirmEmail(req.body.code);
        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.post('/registration-email-resending',
    setRateLimiter(5, 10),
    validateUser.body.email,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<{ email: string }>, res) => {
        await usersService.resendConfirmEmail(req.body.email)
        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.post('/login',
    setRateLimiter(5, 10),
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
        const decodedRefreshToken = jwtService.decodeRefreshJWT(refreshToken);
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
        const userActiveSession: UserActiveSessionType = {
            _id: new ObjectId().toString(),
            issuedAt: decodedRefreshToken?.iat,
            expireAt: decodedRefreshToken?.exp,
            deviceId: decodedRefreshToken?.deviceId,
            IP: ip as string,
            deviceName: req.headers["user-agent"] || '',
            userId: user._id,
        }
        await securityService.registerUserActiveSession(userActiveSession)

        res.status(HTTP_STATUSES.OK_200)
            .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true, maxAge: 20 * 1000})
            .json({"accessToken": authToken})
    })

authRouter.post('/refresh-token', jwtRefreshGuardMiddleware, async (req, res: Response<LoginSuccessViewModel>) => {
    const deviceId = jwtService.getDeviceIdFromRefreshToken(req.cookies.refreshToken);

    const user = req.user!
    const authToken = jwtService.createAuthJWT(user);
    const refreshToken = jwtService.createRefreshJWT(user, deviceId)
    const decodedRefreshToken = jwtService.decodeRefreshJWT(refreshToken);

    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

    const userActiveSessionUpdateModel: UserActiveSessionUpdateModelType = {
        issuedAt: decodedRefreshToken?.iat,
        expireAt: decodedRefreshToken?.exp,
        IP: ip as string,
        deviceName: req.headers["user-agent"] || '',
    }

    await securityService.updateUserActiveSession(deviceId, userActiveSessionUpdateModel)

    res.status(HTTP_STATUSES.OK_200)
        .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true, maxAge: 20 * 1000})
        .json({"accessToken": authToken})
})

authRouter.post('/logout',
    jwtRefreshGuardMiddleware,
    (req: Request, res: Response) => {
        authService.removeUserSession(req.cookies.refreshToken)
        res.clearCookie('refreshToken').sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

authRouter.get('/me', jwtAuthGuardMiddleware,
    async (req: Request, res: Response) => {
        const user = await userQueryRepository.findMe(req.user!._id);
        res.status(HTTP_STATUSES.OK_200).json(user)
    })
