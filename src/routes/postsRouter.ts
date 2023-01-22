import {Request, Response, Router} from "express";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "./types/RequestTypes";
import {postQueryRepository} from "../queryRepository/postQueryRepository";
import {PostInputModel} from "../domain/inputModels/PostInputModel";
import {checkErrorsInRequestDataMiddleware} from "../middlewares/checkErrorsInRequestDataMiddleware";
import {APIErrorResultType} from "./types/apiError/APIErrorResultType";
import {authGuardMiddleware} from "../middlewares/authGuardMiddleware";
import {postsService} from "../domain/service/posts-service";
import {postRepository} from "../repository/postMongoDbRepository";
import {HTTP_STATUSES} from "./types/HttpStatuses";
import {PostPaginatorType} from "../queryRepository/types/PostPaginatorType";
import {validatePost} from "../middlewares/validators/validatePost";
import {validatePaginator} from "../middlewares/validators/validatePaginator";

export const postsRouter = Router({})

postsRouter.get('/',
    validatePost.query.sortBy,
    validatePost.query.sortDirection,
    validatePaginator.pageNumber,
    validatePaginator.pageSize,
    checkErrorsInRequestDataMiddleware,
    async (req: Request, res: Response<PostPaginatorType>) => {
        const sortBy: string = req.query.sortBy ? req.query.sortBy.toString() : 'createdAt';
        const sortDirection: string = req.query.sortDirection ? req.query.sortDirection.toString() : 'asc';
        const pageNumber: number = req.query.pageNumber ? +req.query.pageNumber : 1;
        const pageSize: number = req.query.pageSize ? +req.query.pageSize : 10;

        const posts = await postQueryRepository.findPosts(sortBy, sortDirection, pageNumber, pageSize);
        res.status(HTTP_STATUSES.OK_200).json(posts)
    })

postsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res) => {
    const post = await postQueryRepository.findPost(req.params.id)
    if (!post) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
    res.status(HTTP_STATUSES.OK_200).json(post)
})

postsRouter.post('/',
    authGuardMiddleware,
    validatePost.body.title,
    validatePost.body.shortDescription,
    validatePost.body.content,
    validatePost.body.blogId,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<PostInputModel>, res) => {
        try {
            const newPostId = await postsService.createPost(req.body);
            const newPost = await postQueryRepository.findPost(newPostId);
            if (!newPost) {
                return res.status(HTTP_STATUSES.UNPROCESSABLE_ENTITY)
            }
            res.status(HTTP_STATUSES.CREATED_201).json(newPost);
        } catch (e) {
            const err = e as Error
            const apiErrorResult: APIErrorResultType = {
                errorsMessages: [{
                    field: req.body.blogId,
                    message: err.message
                }]
            }
            return res.status(HTTP_STATUSES.BAD_REQUEST_400).json(apiErrorResult)
        }
    })

postsRouter.put('/:id',
    authGuardMiddleware,
    validatePost.body.title,
    validatePost.body.shortDescription,
    validatePost.body.content,
    validatePost.body.blogId,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res) => {

        const post = await postRepository.findPost(req.params.id);
        if (!post) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        try {
            await postsService.updatePost(req.params.id, req.body)
        } catch (e) {
            const err = e as Error
            const apiErrorResult: APIErrorResultType = {
                errorsMessages: [{
                    field: req.body.blogId,
                    message: err.message
                }]
            }
            return res.status(HTTP_STATUSES.BAD_REQUEST_400).json(apiErrorResult)
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

postsRouter.delete('/:id', authGuardMiddleware, async (req: RequestWithParams<{ id: string }>, res) => {
    await postsService.deletePost(req.params.id)
        ? res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        : res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
})
