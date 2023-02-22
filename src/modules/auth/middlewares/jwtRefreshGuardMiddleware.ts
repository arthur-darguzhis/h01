import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../../../common/presentationLayer/types/HttpStatuses";
import {jwtService} from "../jwt/jwtService";
import {UsersService} from "../../user/usersService";
import {container} from "../../../common/compositon-root";

const usersService = container.resolve(UsersService)

export const jwtRefreshGuardMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.cookies || !req.cookies.refreshToken || req.cookies.refreshToken === '') {
        return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }

    try {
        jwtService.verifyRefreshJWT(req.cookies.refreshToken)
    } catch (err) {
        return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }

    const userId = jwtService.getUserIdFromRefreshToken(req.cookies.refreshToken);
    req.user = await usersService.findUserById(userId)
    next();
}
