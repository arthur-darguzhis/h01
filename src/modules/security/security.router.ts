import {Router} from "express";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {jwtRefreshGuardMiddleware} from "../auth/middlewares/jwtRefreshGuardMiddleware";
import {container} from "../../common/compositon-root";
import {DeviceSessionsController} from "./deviceSessionsController";

export const securityRouter = Router({})

const deviceSessionsController = container.resolve(DeviceSessionsController)

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
