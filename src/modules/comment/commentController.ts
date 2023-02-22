import {injectable} from "inversify";
import {CommentsService} from "./commentsService";
import {CommentQueryRepository} from "./repository/comment.QueryRepository";
import {RequestWithParams, RequestWithParamsAndBody} from "../../common/presentationLayer/types/RequestTypes";
import {Response} from "express";
import {jwtService} from "../auth/jwt/jwtService";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {CommentInputModel} from "./types/CommentInputModel";
import {LikeInputModel} from "./types/LikeInputModel";

@injectable()
export class CommentController {
    constructor(
        protected commentsService: CommentsService,
        protected commentQueryRepository: CommentQueryRepository
    ) {
    }

    async getComment(req: RequestWithParams<{ commentId: string }>, res: Response) {
        let userId = null;
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1]
            userId = jwtService.getUserIdFromAccessToken(token);
        }
        const comment = await this.commentQueryRepository.get(req.params.commentId, userId)
        res.status(HTTP_STATUSES.OK_200).json(comment)
    }

    async updateComment(req: RequestWithParamsAndBody<{ id: string }, CommentInputModel>, res: Response) {
        const commentInputModel: CommentInputModel = {content: req.body.content};
        await this.commentsService.updateUsersComment(req.params.id, req.user!._id, commentInputModel)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async deleteComment(req: RequestWithParams<{ id: string }>, res: Response) {
        await this.commentsService.deleteUsersComment(req.params.id, req.user!._id)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async processLikeStatus(req: RequestWithParamsAndBody<{ id: string }, LikeInputModel>, res: Response) {
        await this.commentsService.processLikeStatus(req.user!._id, req.params.id, req.body.likeStatus);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }
}
