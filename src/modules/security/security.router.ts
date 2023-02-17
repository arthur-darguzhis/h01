import {Router} from "express";
import {usersActiveSessionsQueryRepository} from "./repository/security.usersActiveSessionsQueryRepository";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {securityService} from "./security.service";
import {RequestWithParams} from "../../common/presentationLayer/types/RequestTypes";
import {jwtRefreshGuardMiddleware} from "../auth/middlewares/jwtRefreshGuardMiddleware";
import {jwtService} from "../auth/jwt/jwtService";

export const securityRouter = Router({})

securityRouter.get('/devices',
    jwtRefreshGuardMiddleware,
    checkErrorsInRequestDataMiddleware,
    async (req, res) => {
        const allActiveUsersSessions = await usersActiveSessionsQueryRepository.findByUserId(req.user!._id)
        res.status(HTTP_STATUSES.OK_200).json(allActiveUsersSessions)
    })

securityRouter.delete('/devices',
    jwtRefreshGuardMiddleware,
    checkErrorsInRequestDataMiddleware,
    async (req, res) => {
        const deviceId = jwtService.getDeviceIdFromRefreshToken(req.cookies.refreshToken);
        await securityService.removeOtherDeviceSessions(req.user!._id, deviceId);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

securityRouter.delete('/devices/:deviceId',
    jwtRefreshGuardMiddleware,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParams<{ deviceId: string }>, res) => {
        await securityService.removeUserSessionsByDeviceId(req.user!._id, req.params.deviceId);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })
