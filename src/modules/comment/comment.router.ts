import {container} from "../../common/compositon-root";
import {Router} from "express";
import {jwtAuthGuardMiddleware} from "../auth/middlewares/jwtAuthGuardMiddleware";
import {validateComment} from "./middlewares/validateComment";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {validateLikeStatus} from "./middlewares/validateLikeStatus";
import {CommentController} from "./commentController";

export const commentRouter = Router({})

const commentController = container.resolve(CommentController);

commentRouter.get('/:commentId', commentController.getComment.bind(commentController))

commentRouter.put('/:id',
    jwtAuthGuardMiddleware,
    validateComment.body.content,
    checkErrorsInRequestDataMiddleware,
    commentController.updateComment.bind(commentController))

commentRouter.delete('/:id',
    jwtAuthGuardMiddleware,
    commentController.deleteComment.bind(commentController))

commentRouter.put('/:id/like-status',
    jwtAuthGuardMiddleware,
    validateLikeStatus.body.likeStatus,
    checkErrorsInRequestDataMiddleware,
    commentController.processLikeStatus.bind(commentController))
