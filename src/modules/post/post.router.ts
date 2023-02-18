import {Response, Router} from "express";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../../common/presentationLayer/types/RequestTypes";
import {PostQueryRepository} from "./repository/post.QueryRepository";
import {PostInputModel} from "./types/PostInputModel";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {authGuardMiddleware} from "../auth/middlewares/authGuardMiddleware";
import {postsService} from "./postsService";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {validatePost} from "./middlewares/validatePost";
import {validatePaginator} from "../../common/middlewares/validatePaginator";
import {CommentInputModel} from "../comment/types/CommentInputModel";
import {validateComment} from "../comment/middlewares/validateComment";
import {jwtAuthGuardMiddleware} from "../auth/middlewares/jwtAuthGuardMiddleware";
import {CommentsService} from "../comment/commentsService";
import {CommentQueryRepository} from "../comment/repository/comment.QueryRepository";
import {mapCommentToViewModel} from "../comment/comment.mapper";
import {mapPostToViewModel} from "./post.mapper";
import {PaginatorResponse} from "../auth/types/paginator/PaginatorResponse";
import {PostViewModel} from "./types/PostViewModel";
import {PaginatorParams} from "../auth/types/paginator/PaginatorParams";
import {jwtService} from "../auth/jwt/jwtService";

export const postRouter = Router({})

class PostController {
    private commentsService: CommentsService
    private commentQueryRepository: CommentQueryRepository
    private postQueryRepository: PostQueryRepository

    constructor() {
        this.commentsService = new CommentsService();
        this.commentQueryRepository = new CommentQueryRepository();
        this.postQueryRepository = new PostQueryRepository()
    }

    async createPost(req: RequestWithBody<PostInputModel>, res: Response) {
        const newPost = await postsService.createPost(req.body);
        res.status(HTTP_STATUSES.CREATED_201).json(mapPostToViewModel(newPost));
    }

    async getPaginatedPostsList(req: RequestWithQuery<PaginatorParams>, res: Response<PaginatorResponse<PostViewModel>>) {
        const paginatedPostList = await this.postQueryRepository.findPosts(req.query);
        res.status(HTTP_STATUSES.OK_200).json(paginatedPostList)
    }

    async getPost(req: RequestWithParams<{ id: string }>, res: Response) {
        const post = await this.postQueryRepository.get(req.params.id)
        res.status(HTTP_STATUSES.OK_200).json(post)
    }

    async updatePost(req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res: Response) {
        await postsService.updatePost(req.params.id, req.body)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async deletePost(req: RequestWithParams<{ id: string }>, res: Response) {
        await postsService.deletePost(req.params.id)
        return res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async addCommentToPost(req: RequestWithParamsAndBody<{ postId: string }, CommentInputModel>, res: Response) {
        const newComment = await this.commentsService.addComment(req.params.postId, req.body, req.user!);
        return res.status(HTTP_STATUSES.CREATED_201).json(mapCommentToViewModel(newComment));
    }

    async getPaginatedCommentsListForPost(req: RequestWithParamsAndQuery<{ postId: string }, PaginatorParams>, res: Response) {
        let userId = null;
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1]
            userId = jwtService.getUserIdFromAccessToken(token);
        }
        const paginatedCommentsList = await this.commentQueryRepository.findCommentsByPostId(req.params.postId, req.query, userId)
        res.status(HTTP_STATUSES.OK_200).json(paginatedCommentsList);
    }
}

const postController = new PostController()
postRouter.post('/',
    authGuardMiddleware,
    validatePost.body.title,
    validatePost.body.shortDescription,
    validatePost.body.content,
    validatePost.body.blogId,
    checkErrorsInRequestDataMiddleware,
    postController.createPost.bind(postController))

postRouter.get('/',
    validatePost.query.sortBy,
    validatePost.query.sortDirection,
    validatePaginator.pageNumber,
    validatePaginator.pageSize,
    checkErrorsInRequestDataMiddleware,
    postController.getPaginatedPostsList.bind(postController))

postRouter.get('/:id', postController.getPost.bind(postController))

postRouter.put('/:id',
    authGuardMiddleware,
    validatePost.body.title,
    validatePost.body.shortDescription,
    validatePost.body.content,
    validatePost.body.blogId,
    checkErrorsInRequestDataMiddleware,
    postController.updatePost.bind(postController))

postRouter.delete('/:id', authGuardMiddleware, postController.deletePost.bind(postController))

postRouter.post('/:postId/comments',
    jwtAuthGuardMiddleware,
    validateComment.body.content,
    checkErrorsInRequestDataMiddleware,
    postController.addCommentToPost.bind(postController))

postRouter.get('/:postId/comments',
    validateComment.query.sortBy,
    validateComment.query.sortDirection,
    validatePaginator.pageSize,
    validatePaginator.pageNumber,
    checkErrorsInRequestDataMiddleware,
    postController.getPaginatedCommentsListForPost.bind(postController))
