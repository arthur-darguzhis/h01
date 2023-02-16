import {Router} from "express";
import {RequestWithParams, RequestWithParamsAndBody} from "../../common/presentationLayer/types/RequestTypes";
import {commentQueryRepository} from "./repository/comment.QueryRepository";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {CommentInputModel} from "./types/CommentInputModel";
import {commentsService} from "./comments-service";
import {jwtAuthGuardMiddleware} from "../auth/middlewares/jwtAuthGuardMiddleware";
import {validateComment} from "./middlewares/validateComment";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {LikeInputModel} from "./types/LikeInputModel";
import {validateLikeStatus} from "./middlewares/validateLikeStatus";
import {jwtService} from "../auth/jwt/jwt-service";

export const commentRouter = Router({})

commentRouter.get('/:commentId', async (req: RequestWithParams<{ commentId: string }>, res) => {
    let userId = null;
    if (req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1]
        userId = jwtService.getUserIdFromAccessToken(token);
    }
    const comment = await commentQueryRepository.get(req.params.commentId, userId)
    res.status(HTTP_STATUSES.OK_200).json(comment)
})

commentRouter.put('/:id',
    jwtAuthGuardMiddleware,
    validateComment.body.content,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, CommentInputModel>, res) => {
        const commentInputModel: CommentInputModel = {content: req.body.content};
        await commentsService.updateUsersComment(req.params.id, req.user!._id, commentInputModel)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

commentRouter.delete('/:id',
    jwtAuthGuardMiddleware,
    async (req: RequestWithParams<{ id: string }>, res) => {
        await commentsService.deleteUsersComment(req.params.id, req.user!._id)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

commentRouter.put('/:id/like-status',
    jwtAuthGuardMiddleware,
    validateLikeStatus.body.likeStatus,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, LikeInputModel>, res) => {
        await commentsService.processLikeStatus(req.user!._id, req.params.id, req.body.likeStatus);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })
