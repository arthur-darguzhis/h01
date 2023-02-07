import {NextFunction, Request, Response} from "express";
import {HTTP_STATUSES} from "../../../common/presentationLayer/types/HttpStatuses";
import {jwtService} from "../../jwt/jwt-service";
import {usersService} from "../../user/users-service";

export const jwtAuthGuardMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    //Почему здесь authorization а не authentification? (по тому что JWT токен не про аутентификацию он про авторизацию когда нас идентифицировали и уже выдали паспорт этот паспорт и есть наш JWT токен с его помощью мы авторизируемся на какие то дейсвтия. мы проверяем что наш пользователь авторизирован для оставления коммента или других действий.)
    if(!req.headers.authorization){
        return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    }

    const token = req.headers.authorization.split(' ')[1] //почему делим? из чего состоит строка?     "bearer asdf;lkjasdf;lkjasdf;lkj"

    try{
        await jwtService.verifyAuthJWT(token)
    } catch (err) {
        return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    }

    const userId = jwtService.getUserIdFromAccessToken(token);
    if(!userId){
        return res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401);
    }
    req.user = await usersService.findUserById(userId)
    next();
}
