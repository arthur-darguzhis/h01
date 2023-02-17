import {Response, Router} from "express";
import {RequestWithParams, RequestWithParamsAndBody} from "../../common/presentationLayer/types/RequestTypes";
import {commentQueryRepository} from "./repository/comment.QueryRepository";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {CommentInputModel} from "./types/CommentInputModel";
import {commentsService} from "./commentsService";
import {jwtAuthGuardMiddleware} from "../auth/middlewares/jwtAuthGuardMiddleware";
import {validateComment} from "./middlewares/validateComment";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {LikeInputModel} from "./types/LikeInputModel";
import {validateLikeStatus} from "./middlewares/validateLikeStatus";
import {jwtService} from "../auth/jwt/jwtService";

export const commentRouter = Router({})

class CommentController {
    async getComment(req: RequestWithParams<{ commentId: string }>, res: Response) {
        let userId = null;
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1]
            userId = jwtService.getUserIdFromAccessToken(token);
        }
        const comment = await commentQueryRepository.get(req.params.commentId, userId)
        res.status(HTTP_STATUSES.OK_200).json(comment)
    }

    async updateComment(req: RequestWithParamsAndBody<{ id: string }, CommentInputModel>, res: Response) {
        const commentInputModel: CommentInputModel = {content: req.body.content};
        await commentsService.updateUsersComment(req.params.id, req.user!._id, commentInputModel)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async deleteComment(req: RequestWithParams<{ id: string }>, res: Response) {
        await commentsService.deleteUsersComment(req.params.id, req.user!._id)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async processLikeStatus(req: RequestWithParamsAndBody<{ id: string }, LikeInputModel>, res: Response) {
        await commentsService.processLikeStatus(req.user!._id, req.params.id, req.body.likeStatus);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }
}

const commentController = new CommentController();

commentRouter.get('/:commentId', commentController.getComment)

commentRouter.put('/:id',
    jwtAuthGuardMiddleware,
    validateComment.body.content,
    checkErrorsInRequestDataMiddleware,
    commentController.updateComment)

commentRouter.delete('/:id',
    jwtAuthGuardMiddleware,
    commentController.deleteComment)

commentRouter.put('/:id/like-status',
    jwtAuthGuardMiddleware,
    validateLikeStatus.body.likeStatus,
    checkErrorsInRequestDataMiddleware,
    commentController.processLikeStatus)
