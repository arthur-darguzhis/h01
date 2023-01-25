import {Router} from "express";
import {RequestWithParams, RequestWithParamsAndBody} from "./types/RequestTypes";
import {commentQueryRepository} from "../queryRepository/commentQueryRepository";
import {HTTP_STATUSES} from "./types/HttpStatuses";
import {CommentInputModel} from "./inputModels/CommentInputModel";
import {commentsService} from "../domain/service/comments-service";
import {jwtAuthGuardMiddleware} from "../middlewares/jwtAuthGuardMiddleware";
import {validateComment} from "../middlewares/validators/validateComment";
import {EntityNotFound} from "../domain/exceptions/EntityNotFound";
import {Forbidden} from "../domain/exceptions/Forbidden";
import {checkErrorsInRequestDataMiddleware} from "../middlewares/checkErrorsInRequestDataMiddleware";

export const commentsRouter = Router({})

commentsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res) => {
    const comment = await commentQueryRepository.findComment(req.params.id)
    if (!comment) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
    res.status(HTTP_STATUSES.OK_200).json(comment)
})

commentsRouter.put('/:id',
    jwtAuthGuardMiddleware,
    validateComment.body.content,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, CommentInputModel>, res) => {
        const commentInputModel: CommentInputModel = {content: req.body.content};

        try {
            await commentsService.updateUsersComment(req.params.id, req.user!._id, commentInputModel)
        } catch (e) {
            if (e instanceof EntityNotFound) {
                return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            }

            if (e instanceof Forbidden) {
                return res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
            }
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

commentsRouter.delete('/:id',
    jwtAuthGuardMiddleware,
    async (req: RequestWithParams<{ id: string }>, res) => {
        try {
            await commentsService.deleteUserComment(req.params.id, req.user!._id)
        } catch (e) {
            if (e instanceof EntityNotFound) {
                return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
            }
            if (e instanceof Forbidden) {
                return res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
            }
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })
