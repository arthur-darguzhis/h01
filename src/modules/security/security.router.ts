import {Request, Response, Router} from "express";
import {UsersActiveSessionsQueryRepository} from "./repository/security.usersActiveSessionsQueryRepository";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {SecurityService} from "./securityService";
import {RequestWithParams} from "../../common/presentationLayer/types/RequestTypes";
import {jwtRefreshGuardMiddleware} from "../auth/middlewares/jwtRefreshGuardMiddleware";
import {jwtService} from "../auth/jwt/jwtService";

export const securityRouter = Router({})

class DeviceSessionsController {
    private securityService: SecurityService
    private usersActiveSessionsQueryRepository: UsersActiveSessionsQueryRepository

    constructor() {
        this.securityService = new SecurityService()
        this.usersActiveSessionsQueryRepository = new UsersActiveSessionsQueryRepository()
    }

    async getDevicesSessionsForUser(req: Request, res: Response) {
        const allActiveUsersSessions = await this.usersActiveSessionsQueryRepository.findByUserId(req.user!._id)
        res.status(HTTP_STATUSES.OK_200).json(allActiveUsersSessions)
    }

    async removeAllUsersDevicesSessionsExcludingCurrentOne(req: Request, res: Response) {
        const deviceId = jwtService.getDeviceIdFromRefreshToken(req.cookies.refreshToken);
        await this.securityService.removeOtherDeviceSessions(req.user!._id, deviceId);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async removeUserSessionsByDeviceId(req: RequestWithParams<{ deviceId: string }>, res: Response) {
        await this.securityService.removeUserSessionsByDeviceId(req.user!._id, req.params.deviceId);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }
}

const deviceSessionsController = new DeviceSessionsController()

securityRouter.get('/devices',
    jwtRefreshGuardMiddleware,
    checkErrorsInRequestDataMiddleware,
    deviceSessionsController.getDevicesSessionsForUser.bind(deviceSessionsController))

securityRouter.delete('/devices',
    jwtRefreshGuardMiddleware,
    checkErrorsInRequestDataMiddleware,
    deviceSessionsController.removeAllUsersDevicesSessionsExcludingCurrentOne.bind(deviceSessionsController))

securityRouter.delete('/devices/:deviceId',
    jwtRefreshGuardMiddleware,
    checkErrorsInRequestDataMiddleware,
    deviceSessionsController.removeUserSessionsByDeviceId.bind(deviceSessionsController))
