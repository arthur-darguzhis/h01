import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../../../common/presentationLayer/types/HttpStatuses";
import {jwtService} from "../../jwt/jwt-service";
import {usersService} from "../../user/users-service";
import {refreshTokensBlackListRepository} from "../refreshTokensBlackListRepository";

export const jwtRefreshGuardMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies || !req.cookies.refreshToken || req.cookies.refreshToken === '') {
        return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }

    try {
        jwtService.verifyRefreshJWT(req.cookies.refreshToken)
    } catch (err) {
        return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }

    const userId = jwtService.getUserIdByRefreshJWT(req.cookies.refreshToken);
    if (!userId) {
        return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    }

    const isTokenInBlackList = await refreshTokensBlackListRepository.isTokenInBlackList(userId, req.cookies.refreshToken)
    if (isTokenInBlackList) {
        return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    }

    req.user = await usersService.findUserById(userId)
    next();
}
