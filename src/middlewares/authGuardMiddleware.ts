import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../types/requestTypes";
import {atob} from "buffer";
import {userRepository} from "../repository/userRepository";

export const authGuardMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const basicAuthValue = req.header("Authorization")
        const base64Val = basicAuthValue?.replace('Basic ', '');
        const [login, password] = atob(base64Val + '').split(':');
        if (userRepository.isUserExists(login, password)) {
            next();
            return;
        }
    } catch (e) {
    }

    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    return
}
