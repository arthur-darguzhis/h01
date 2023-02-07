import {Router} from "express";
import {usersActiveSessionsQueryRepository} from "./security.usersActiveSessionsQueryRepository";
import {jwtAuthGuardMiddleware} from "../auth/middlewares/jwtAuthGuardMiddleware";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {securityService} from "./security.service";
import {RequestWithParams} from "../../common/presentationLayer/types/RequestTypes";

export const securityRouter = Router({})

securityRouter.get('/devices',
    jwtAuthGuardMiddleware,
    checkErrorsInRequestDataMiddleware,
    async (req, res) => {
        const allActiveUsersSessions = await usersActiveSessionsQueryRepository.findByUserId(req.user!._id)
        res.status(HTTP_STATUSES.OK_200).json(allActiveUsersSessions)
    })

securityRouter.delete('/devices',
    jwtAuthGuardMiddleware,
    checkErrorsInRequestDataMiddleware,
    async (req, res) => {
        await securityService.removeAllUserSessions(req.user!._id);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

securityRouter.delete('/devices/:deviceId',
    jwtAuthGuardMiddleware,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParams<{ deviceId: string }>, res) => {
        await securityService.removeUserSessionsByDeviceId(req.user!._id, req.params.deviceId);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })
