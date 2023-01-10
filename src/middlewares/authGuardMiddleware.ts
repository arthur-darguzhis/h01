import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../types/requestTypes";
import {atob} from "buffer";
import {userRepository} from "../repository/userRepository";

export const authGuardMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const basicAuthValue = req.header("Authorization")

    if (basicAuthValue) {
        const base64Val = basicAuthValue.replace('Basic ', '');
        const [login, password] = atob(base64Val).split(':');
        if (userRepository.isUserExists(login, password)) {
            next();
        }
    }
    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    return
}
