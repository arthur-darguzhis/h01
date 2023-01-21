import {Request, Response, NextFunction} from "express";
import {validationResult} from "express-validator";
import {HTTP_STATUSES} from "../routes/types/HttpStatuses";

export const checkErrorsInRequestDataMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorsArray = errors.array().map(e => (
            {
                message: e.msg,
                field: e.param
            }
        ));
        return res.status(HTTP_STATUSES.BAD_REQUEST_400).json({errorsMessages: errorsArray});
    }
    next();
}
