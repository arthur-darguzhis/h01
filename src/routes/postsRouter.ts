import {Response, Router} from "express";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "./types/RequestTypes";
import {postQueryRepository} from "../queryRepository/postQueryRepository";
import {PostInputModel} from "./inputModels/PostInputModel";
import {checkErrorsInRequestDataMiddleware} from "../middlewares/checkErrorsInRequestDataMiddleware";
import {APIErrorResultType} from "./types/apiError/APIErrorResultType";
import {authGuardMiddleware} from "../middlewares/authGuardMiddleware";
import {postsService} from "../domain/service/posts-service";
import {postRepository} from "../repository/postMongoDbRepository";
import {HTTP_STATUSES} from "./types/HttpStatuses";
import {PostPaginatorType} from "../queryRepository/types/Post/PostPaginatorType";
import {validatePost} from "../middlewares/validators/validatePost";
import {validatePaginator} from "../middlewares/validators/validatePaginator";
import {PostViewModel} from "../queryRepository/types/Post/PostViewModel";
import {CommentInputModel} from "./inputModels/CommentInputModel";
import {validateComment} from "../middlewares/validators/validateComment";
import {jwtAuthGuardMiddleware} from "../middlewares/jwtAuthGuardMiddleware";
import {commentService} from "../domain/service/comment-service";
import {commentQueryRepository} from "../queryRepository/commentQueryRepository";
import {CommentViewModel} from "../queryRepository/types/Comment/CommentViewModel";

export const postsRouter = Router({})

postsRouter.get('/',
    validatePost.query.sortBy,
    validatePost.query.sortDirection,
    validatePaginator.pageNumber,
    validatePaginator.pageSize,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithQuery<{ sortBy: string, sortDirection: string, pageSize: string, pageNumber: string }>,
           res: Response<PostPaginatorType>) => {

        const {sortBy, sortDirection, pageNumber, pageSize} = req.query
        const posts = await postQueryRepository.findPosts(sortBy, sortDirection, +pageNumber, +pageSize);
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
            const newPost = await postQueryRepository.findPost(newPostId) as PostViewModel;
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

postsRouter.post('/:id/comments',
    jwtAuthGuardMiddleware,
    validateComment.body.content,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, CommentInputModel>, res) => {
        try {
            const newCommentId = await commentService.addComment(req.params.id, req.body, req.user!);
            const newComment = await commentQueryRepository.findComment(newCommentId) as CommentViewModel
            res.status(HTTP_STATUSES.CREATED_201).json(newComment);
        } catch (e) {
            const err = e as Error
            const apiErrorResult: APIErrorResultType = {
                errorsMessages: [{
                    field: req.params.id,
                    message: err.message
                }]
            }
            return res.status(HTTP_STATUSES.NOT_FOUND_404).json(apiErrorResult)
        }
    })

postsRouter.get('/:id/comments',
    validateComment.query.sortBy,
    validateComment.query.sortDirection,
    validatePaginator.pageSize,
    validatePaginator.pageNumber,
    async (req: RequestWithParamsAndQuery<{ id: string }, { sortBy: string, sortDirection: string, pageSize: string, pageNumber: string }>, res) => {
        const post = await postQueryRepository.findPost(req.params.id);
        if(!post){
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }

        const {sortBy, sortDirection, pageNumber, pageSize} = req.query
        const comments = await commentQueryRepository.findCommentsByPostId(req.params.id, sortBy, sortDirection, +pageNumber, +pageSize)

        res.status(HTTP_STATUSES.OK_200).json(comments);
    })

