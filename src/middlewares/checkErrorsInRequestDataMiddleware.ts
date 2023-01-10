import {Request, Response, NextFunction} from "express";
import {validationResult} from "express-validator";
import {HTTP_STATUSES} from "../types/requestTypes";

export const checkErrorsInRequestDataMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsArray = errors.array().map(e => (
            {
                message: e.msg,
                field: e.param
            }
        ));

        res.status(HTTP_STATUSES.BAD_REQUEST_400).json({errorsMessages: errorsArray});
        return
    }
    next();
}
