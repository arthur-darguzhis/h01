import {Response, Router} from "express";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery,
    RequestWithQuery
} from "../../common/presentationLayer/types/RequestTypes";
import {BlogInputModel} from "./types/BlogInputModel";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {authGuardMiddleware} from "../auth/middlewares/authGuardMiddleware";
import {BlogsService} from "./blogsService";
import {BlogQueryRepository} from "./repository/blog.QueryRepository";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {PostQueryRepository} from "../post/repository/post.QueryRepository";
import {validatePaginator} from "../../common/middlewares/validatePaginator";
import {validateBlog} from "./middlewares/validateBlog";
import {validatePost} from "../post/middlewares/validatePost";
import {PostsService} from "../post/postsService";
import {BlogPostInputModel} from "./types/BlogPostInputModel";
import {mapPostToViewModel} from "../post/post.mapper";
import {mapBlogToViewModel} from "./blog.mapper";
import {PaginatorResponse} from "../auth/types/paginator/PaginatorResponse";
import {BlogViewModel} from "./types/BlogViewModel";
import {BlogPaginatorParams} from "./types/BlogPaginatorParams";
import {PaginatorParams} from "../auth/types/paginator/PaginatorParams";

export const blogRouter = Router({})

class BlogController {
    private postQueryRepository: PostQueryRepository
    private blogQueryRepository: BlogQueryRepository
    private blogsService: BlogsService
    private postsService: PostsService

    constructor() {
        this.postQueryRepository = new PostQueryRepository()
        this.blogQueryRepository = new BlogQueryRepository()
        this.blogsService = new BlogsService()
        this.postsService = new PostsService()
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
        const paginatedPostList = await this.postQueryRepository.findPostsByBlogId(req.params.id, req.query);
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

const blogController = new BlogController()

blogRouter.get('/',
    validateBlog.query.searchNameTerm,
    validateBlog.query.sortBy,
    validateBlog.query.sortDirection,
    validatePaginator.pageSize,
    validatePaginator.pageNumber,
    checkErrorsInRequestDataMiddleware,
    blogController.getPaginatedBlogList.bind(blogController))

blogRouter.get('/:id', blogController.getBlog.bind(blogController))

blogRouter.get('/:id/posts',
    validatePost.query.sortBy,
    validatePost.query.sortDirection,
    validatePaginator.pageSize,
    validatePaginator.pageNumber,
    checkErrorsInRequestDataMiddleware,
    blogController.getPaginatedPostListByPost.bind(blogController))

blogRouter.post('/',
    authGuardMiddleware,
    validateBlog.body.name,
    validateBlog.body.description,
    validateBlog.body.websiteUrl,
    checkErrorsInRequestDataMiddleware,
    blogController.createBlog.bind(blogController))


blogRouter.post('/:id/posts',
    authGuardMiddleware,
    validatePost.body.title,
    validatePost.body.shortDescription,
    validatePost.body.content,
    checkErrorsInRequestDataMiddleware,
    blogController.createPostInBlog.bind(blogController))

blogRouter.put('/:id',
    authGuardMiddleware,
    validateBlog.body.name,
    validateBlog.body.description,
    validateBlog.body.websiteUrl,
    checkErrorsInRequestDataMiddleware,
    blogController.updateBlog.bind(blogController))

blogRouter.delete('/:id', authGuardMiddleware, blogController.deleteBlog.bind(blogController))
