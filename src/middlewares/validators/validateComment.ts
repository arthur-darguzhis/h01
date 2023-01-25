import {body} from "express-validator";

export const validateComment = {
    body: {
        content: body('content').trim().isLength({min: 20, max: 300})
    }
}
