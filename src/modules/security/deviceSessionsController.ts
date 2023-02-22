import {injectable} from "inversify";
import {SecurityService} from "./securityService";
import {UsersActiveSessionsQueryRepository} from "./repository/security.usersActiveSessionsQueryRepository";
import {Request, Response} from "express";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {jwtService} from "../auth/jwt/jwtService";
import {RequestWithParams} from "../../common/presentationLayer/types/RequestTypes";

@injectable()
export class DeviceSessionsController {
    constructor(
        protected securityService: SecurityService,
        protected usersActiveSessionsQueryRepository: UsersActiveSessionsQueryRepository
    ) {
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
