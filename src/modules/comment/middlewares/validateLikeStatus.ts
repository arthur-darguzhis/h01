import {body} from "express-validator";
import {LikeOfComment} from "../types/LikeOfCommentType";

export const validateLikeStatus = {
    body: {
        likeStatus: body('likeStatus').isIn(Object.values(LikeOfComment.LIKE_STATUS_OPTIONS))
    }
}
