import {Response, Router} from "express";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../../routes/types/RequestTypes";
import {postQueryRepository} from "./post.QueryRepository";
import {PostInputModel} from "../../routes/inputModels/PostInputModel";
import {checkErrorsInRequestDataMiddleware} from "../../middlewares/checkErrorsInRequestDataMiddleware";
import {APIErrorResultType} from "../../routes/types/apiError/APIErrorResultType";
import {authGuardMiddleware} from "../../middlewares/authGuardMiddleware";
import {postsService} from "../../domain/service/posts-service";
import {postRepository} from "./post.MongoDbRepository";
import {HTTP_STATUSES} from "../../routes/types/HttpStatuses";
import {validatePost} from "../../middlewares/validators/validatePost";
import {validatePaginator} from "../../middlewares/validators/validatePaginator";
import {CommentInputModel} from "../../routes/inputModels/CommentInputModel";
import {validateComment} from "../../middlewares/validators/validateComment";
import {jwtAuthGuardMiddleware} from "../../middlewares/jwtAuthGuardMiddleware";
import {commentsService} from "../../domain/service/comments-service";
import {commentQueryRepository} from "../comment/comment.QueryRepository";
import {mapCommentToViewModel} from "../comment/comment.mapper";
import {mapPostToViewModel} from "./post.mapper";
import {PaginatorResponse} from "../../routes/types/paginator/PaginatorResponse";
import {PostViewModel} from "../../queryRepository/types/Post/PostViewModel";
import {PaginatorParams} from "../../routes/types/paginator/PaginatorParams";

export const postRouter = Router({})

postRouter.get('/',
    validatePost.query.sortBy,
    validatePost.query.sortDirection,
    validatePaginator.pageNumber,
    validatePaginator.pageSize,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithQuery<PaginatorParams>, res: Response<PaginatorResponse<PostViewModel>>) => {
        const paginatedPostList = await postQueryRepository.findPosts(req.query);
        res.status(HTTP_STATUSES.OK_200).json(paginatedPostList)
    })

postRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res) => {
    const post = await postQueryRepository.findPost(req.params.id)
    if (!post) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
    res.status(HTTP_STATUSES.OK_200).json(post)
})

postRouter.post('/',
    authGuardMiddleware,
    validatePost.body.title,
    validatePost.body.shortDescription,
    validatePost.body.content,
    validatePost.body.blogId,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<PostInputModel>, res) => {
        try {
            const newPost = await postsService.createPost(req.body);
            res.status(HTTP_STATUSES.CREATED_201).json(mapPostToViewModel(newPost));
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

postRouter.put('/:id',
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

postRouter.delete('/:id', authGuardMiddleware, async (req: RequestWithParams<{ id: string }>, res) => {
    await postsService.deletePost(req.params.id)
        ? res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        : res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
})

postRouter.post('/:postId/comments',
    jwtAuthGuardMiddleware,
    validateComment.body.content,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndBody<{ postId: string }, CommentInputModel>, res) => {
        try {
            const newComment = await commentsService.addComment(req.params.postId, req.body, req.user!);
            return res.status(HTTP_STATUSES.CREATED_201).json(mapCommentToViewModel(newComment));
        } catch (e) {
            const err = e as Error
            const apiErrorResult: APIErrorResultType = {
                errorsMessages: [{
                    field: req.params.postId,
                    message: err.message
                }]
            }
            return res.status(HTTP_STATUSES.NOT_FOUND_404).json(apiErrorResult)
        }
    })

postRouter.get('/:postId/comments',
    validateComment.query.sortBy,
    validateComment.query.sortDirection,
    validatePaginator.pageSize,
    validatePaginator.pageNumber,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndQuery<{ postId: string }, PaginatorParams>, res) => {
        const post = await postQueryRepository.findPost(req.params.postId);
        if (!post) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }
        const paginatedCommentsList = await commentQueryRepository.findCommentsByPostId(req.params.postId, req.query)
        res.status(HTTP_STATUSES.OK_200).json(paginatedCommentsList);
    })
