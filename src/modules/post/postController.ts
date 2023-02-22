import {injectable} from "inversify";
import {CommentsService} from "../comment/commentsService";
import {CommentQueryRepository} from "../comment/repository/comment.QueryRepository";
import {PostQueryRepository} from "./repository/post.QueryRepository";
import {PostsService} from "./postsService";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../../common/presentationLayer/types/RequestTypes";
import {PostInputModel} from "./types/PostInputModel";
import {Response} from "express";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {mapPostToViewModel} from "./post.mapper";
import {PaginatorParams} from "../auth/types/paginator/PaginatorParams";
import {PaginatorResponse} from "../auth/types/paginator/PaginatorResponse";
import {PostViewModel} from "./types/PostViewModel";
import {CommentInputModel} from "../comment/types/CommentInputModel";
import {mapCommentToViewModel} from "../comment/comment.mapper";
import {jwtService} from "../auth/jwt/jwtService";

@injectable()
export class PostController {
    constructor(
        protected commentsService: CommentsService,
        protected commentQueryRepository: CommentQueryRepository,
        protected postQueryRepository: PostQueryRepository,
        protected postsService: PostsService) {
    }

    async createPost(req: RequestWithBody<PostInputModel>, res: Response) {
        const newPost = await this.postsService.createPost(req.body);
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
        await this.postsService.updatePost(req.params.id, req.body)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async deletePost(req: RequestWithParams<{ id: string }>, res: Response) {
        await this.postsService.deletePost(req.params.id)
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
