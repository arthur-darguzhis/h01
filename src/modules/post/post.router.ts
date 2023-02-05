import {Response, Router} from "express";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../../common/presentationLayer/types/RequestTypes";
import {postQueryRepository} from "./post.QueryRepository";
import {PostInputModel} from "./types/PostInputModel";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {authGuardMiddleware} from "../auth/middlewares/authGuardMiddleware";
import {postsService} from "./posts-service";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {validatePost} from "./middlewares/validatePost";
import {validatePaginator} from "../../common/middlewares/validatePaginator";
import {CommentInputModel} from "../comment/types/CommentInputModel";
import {validateComment} from "../comment/middlewares/validateComment";
import {jwtAuthGuardMiddleware} from "../auth/middlewares/jwtAuthGuardMiddleware";
import {commentsService} from "../comment/comments-service";
import {commentQueryRepository} from "../comment/comment.QueryRepository";
import {mapCommentToViewModel} from "../comment/comment.mapper";
import {mapPostToViewModel} from "./post.mapper";
import {PaginatorResponse} from "../auth/types/paginator/PaginatorResponse";
import {PostViewModel} from "./types/PostViewModel";
import {PaginatorParams} from "../auth/types/paginator/PaginatorParams";

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
    const post = await postQueryRepository.get(req.params.id)
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
        const newPost = await postsService.createPost(req.body);
        res.status(HTTP_STATUSES.CREATED_201).json(mapPostToViewModel(newPost));
    })

postRouter.put('/:id',
    authGuardMiddleware,
    validatePost.body.title,
    validatePost.body.shortDescription,
    validatePost.body.content,
    validatePost.body.blogId,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res) => {
        await postsService.updatePost(req.params.id, req.body)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

postRouter.delete('/:id', authGuardMiddleware, async (req: RequestWithParams<{ id: string }>, res) => {
    await postsService.deletePost(req.params.id)
    return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

postRouter.post('/:postId/comments',
    jwtAuthGuardMiddleware,
    validateComment.body.content,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndBody<{ postId: string }, CommentInputModel>, res) => {
        const newComment = await commentsService.addComment(req.params.postId, req.body, req.user!);
        return res.status(HTTP_STATUSES.CREATED_201).json(mapCommentToViewModel(newComment));
    })

postRouter.get('/:postId/comments',
    validateComment.query.sortBy,
    validateComment.query.sortDirection,
    validatePaginator.pageSize,
    validatePaginator.pageNumber,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndQuery<{ postId: string }, PaginatorParams>, res) => {
        const paginatedCommentsList = await commentQueryRepository.findCommentsByPostId(req.params.postId, req.query)
        res.status(HTTP_STATUSES.OK_200).json(paginatedCommentsList);
    })
