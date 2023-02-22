import {injectable} from "inversify";
import {UsersService} from "../user/usersService";
import {UserQueryRepository} from "../user/repository/user.QueryRepository";
import {SecurityService} from "../security/securityService";
import {AuthService} from "./authService";
import {RequestWithBody} from "../../common/presentationLayer/types/RequestTypes";
import {UserInputModel} from "../user/types/UserInputModel";
import {Request, Response} from "express";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {RegistrationConfirmationCodeModel} from "./types/RegistrationConfirmationCodeModel";
import {LoginInputModel} from "./types/LoginInputModel";
import {LoginSuccessViewModel} from "./types/LoginSuccessViewModel";
import {jwtService} from "./jwt/jwtService";
import {UserActiveSession} from "../security/types/UserActiveSessionType";
import {UserActiveSessionUpdateModelType} from "../security/types/UserActiveSessionUpdateModelType";
import {PasswordRecoveryInputModel} from "./types/PasswordRecoveryInputModel";
import {NewPasswordRecoveryInputModel} from "./types/NewPasswordRecoveryInputModel";

@injectable()
export class AuthController {

    constructor(
        protected usersService: UsersService,
        protected userQueryRepository: UserQueryRepository,
        protected securityService: SecurityService,
        protected authService: AuthService
    ) {
    }

    async registerNewUser(req: RequestWithBody<UserInputModel>, res: Response) {
        await this.authService.registerNewUser(req.body);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    }

    async userConfirmEmail(req: RequestWithBody<RegistrationConfirmationCodeModel>, res: Response) {
        await this.usersService.confirmEmail(req.body.code);
        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async userResentConfirmEmail(req: RequestWithBody<{ email: string }>, res: Response) {
        await this.usersService.resendConfirmEmail(req.body.email)
        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async userLogin(req: RequestWithBody<LoginInputModel>, res: Response<LoginSuccessViewModel>) {
        const user = await this.usersService.checkCredentials(req.body.loginOrEmail, req.body.password)
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
        await this.securityService.registerUserActiveSession(userActiveSession)

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

        await this.securityService.updateUserActiveSession(deviceId, userActiveSessionUpdateModel)

        res.status(HTTP_STATUSES.OK_200)
            .cookie('refreshToken', refreshToken, {httpOnly: true, secure: true, maxAge: 20 * 1000})
            .json({"accessToken": authToken})
    }

    async userLogout(req: Request, res: Response) {
        await this.authService.removeUserSession(req.cookies.refreshToken)
        res.clearCookie('refreshToken').sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async userRequestPasswordRecovery(req: RequestWithBody<PasswordRecoveryInputModel>, res: Response) {
        try {
            await this.authService.passwordRecovery(req.body)
        } catch (err) {
            console.log('silent exception for prevent user\'s email detection');
        }

        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async userSetNewPassword(req: RequestWithBody<NewPasswordRecoveryInputModel>, res: Response) {
        await this.authService.setNewPassword(req.body)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async getInfoAboutCurrentUser(req: Request, res: Response) {
        const user = await this.userQueryRepository.findMe(req.user!._id);
        res.status(HTTP_STATUSES.OK_200).json(user)
    }
}
