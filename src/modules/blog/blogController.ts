import {PostQueryRepository} from "../post/repository/post.QueryRepository";
import {BlogQueryRepository} from "./repository/blog.QueryRepository";
import {BlogsService} from "./blogsService";
import {PostsService} from "../post/postsService";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../../common/presentationLayer/types/RequestTypes";
import {BlogPaginatorParams} from "./types/BlogPaginatorParams";
import {Response} from "express";
import {PaginatorResponse} from "../auth/types/paginator/PaginatorResponse";
import {BlogViewModel} from "./types/BlogViewModel";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {PaginatorParams} from "../auth/types/paginator/PaginatorParams";
import {BlogPostInputModel} from "./types/BlogPostInputModel";
import {mapPostToViewModel} from "../post/post.mapper";
import {BlogInputModel} from "./types/BlogInputModel";
import {mapBlogToViewModel} from "./blog.mapper";
import {injectable} from "inversify";
import {jwtService} from "../auth/jwt/jwtService";

@injectable()
export class BlogController {
    constructor(
        protected postQueryRepository: PostQueryRepository,
        protected blogQueryRepository: BlogQueryRepository,
        protected blogsService: BlogsService,
        protected postsService: PostsService
    ) {
    }

    async getPaginatedBlogList(req: RequestWithQuery<BlogPaginatorParams>, res: Response<PaginatorResponse<BlogViewModel>>) {
        const PaginatedBlogList = await this.blogQueryRepository.findBlogs(req.query);
        res.status(HTTP_STATUSES.OK_200).json(PaginatedBlogList)
    }

    async getBlog(req: RequestWithParams<{ id: string }>, res: Response) {
        const blog = await this.blogQueryRepository.get(req.params.id)
        res.status(HTTP_STATUSES.OK_200).json(blog)
    }

    async getPaginatedPostListByPost(req: RequestWithParamsAndQuery<{ id: string }, PaginatorParams>, res: Response) {
        let userId = null;
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1]
            userId = jwtService.getUserIdFromAccessToken(token);
        }

        const paginatedPostList = await this.postQueryRepository.findPostsByBlogId(req.params.id, req.query, userId);
        res.status(HTTP_STATUSES.OK_200).json(paginatedPostList)
    }

    async createPostInBlog(req: RequestWithParamsAndBody<{ id: string }, BlogPostInputModel>, res: Response) {
        const newPost = await this.postsService.createPostInBlog(req.params.id, req.body);
        res.status(HTTP_STATUSES.CREATED_201).json(mapPostToViewModel(newPost));
    }

    async createBlog(req: RequestWithBody<BlogInputModel>, res: Response) {
        const newBlog = await this.blogsService.createBlog(req.body);
        res.status(HTTP_STATUSES.CREATED_201).json(mapBlogToViewModel(newBlog));
    }

    async updateBlog(req: RequestWithParamsAndBody<{ id: string }, BlogInputModel>, res: Response) {
        await this.blogsService.updateBlog(req.params.id, req.body)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }

    async deleteBlog(req: RequestWithParams<{ id: string }>, res: Response) {
        await this.blogsService.deleteBlog(req.params.id)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    }
}
