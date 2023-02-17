import {Request, Response, Router} from "express";
import {usersActiveSessionsQueryRepository} from "./repository/security.usersActiveSessionsQueryRepository";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {securityService} from "./securityService";
import {RequestWithParams} from "../../common/presentationLayer/types/RequestTypes";
import {jwtRefreshGuardMiddleware} from "../auth/middlewares/jwtRefreshGuardMiddleware";
import {jwtService} from "../auth/jwt/jwtService";

export const securityRouter = Router({})

class DeviceSessionsController {
    async getDevicesSessionsForUser(req: Request, res: Response) {
        const allActiveUsersSessions = await usersActiveSessionsQueryRepository.findByUserId(req.user!._id)
        res.status(HTTP_STATUSES.OK_200).json(allActiveUsersSessions)
    }

    async removeAllUsersDevicesSessionsExcludingCurrentOne(req: Request, res: Response) {
        const deviceId = jwtService.getDeviceIdFromRefreshToken(req.cookies.refreshToken);
        await securityService.removeOtherDeviceSessions(req.user!._id, deviceId);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async removeUserSessionsByDeviceId(req: RequestWithParams<{ deviceId: string }>, res: Response) {
        await securityService.removeUserSessionsByDeviceId(req.user!._id, req.params.deviceId);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }
}

const deviceSessionsController = new DeviceSessionsController()

securityRouter.get('/devices',
    jwtRefreshGuardMiddleware,
    checkErrorsInRequestDataMiddleware,
    deviceSessionsController.getDevicesSessionsForUser)

securityRouter.delete('/devices',
    jwtRefreshGuardMiddleware,
    checkErrorsInRequestDataMiddleware,
    deviceSessionsController.removeAllUsersDevicesSessionsExcludingCurrentOne)

securityRouter.delete('/devices/:deviceId',
    jwtRefreshGuardMiddleware,
    checkErrorsInRequestDataMiddleware,
    deviceSessionsController.removeUserSessionsByDeviceId)
