import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../../../common/presentationLayer/types/HttpStatuses";
import {atob} from "buffer";
import {userInMemoryRepository} from "../../user/repository/user.inMemoryRepository";

export const authGuardMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const basicAuthValue = req.header("Authorization")
    const base64Val = basicAuthValue?.replace('Basic ', '');
    let login, password;

    try {
        [login, password] = atob(base64Val + '').split(':');
    } catch (e) {
        return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    }

    if (!userInMemoryRepository.isExists(login, password)) {
        return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    }
    next();
}
