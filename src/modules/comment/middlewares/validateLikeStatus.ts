import {body} from "express-validator";
import {LIKE_STATUSES} from "../types/LikeStatus";

export const validateLikeStatus = {
    body: {
        likeStatus: body('likeStatus').notEmpty().isIn(Object.values(LIKE_STATUSES))
    }
}
