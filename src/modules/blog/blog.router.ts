import {Response, Router} from "express";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery, RequestWithQuery
} from "../../routes/types/RequestTypes";
import {BlogInputModel} from "../../routes/inputModels/BlogInputModel";
import {checkErrorsInRequestDataMiddleware} from "../../middlewares/checkErrorsInRequestDataMiddleware";
import {authGuardMiddleware} from "../../middlewares/authGuardMiddleware";
import {blogsService} from "../../domain/service/blogs-service";
import {blogQueryRepository} from "./blog.QueryRepository";
import {HTTP_STATUSES} from "../../routes/types/HttpStatuses";
import {postQueryRepository} from "../post/post.QueryRepository";
import {validatePaginator} from "../../middlewares/validators/validatePaginator";
import {validateBlog} from "../../middlewares/validators/validateBlog";
import {validatePost} from "../../middlewares/validators/validatePost";
import {postsService} from "../../domain/service/posts-service";
import {APIErrorResultType} from "../../routes/types/apiError/APIErrorResultType";
import {BlogPostInputModel} from "../../routes/inputModels/BlogPostInputModel";
import {postRepository} from "../post/post.MongoDbRepository";
import {mapPostToViewModel} from "../post/post.mapper";
import {mapBlogToViewModel} from "./blog.mapper";
import {PaginatorResponse} from "../../routes/types/paginator/PaginatorResponse";
import {BlogViewModel} from "../../queryRepository/types/Blog/BlogViewModel";
import {BlogPaginatorParams} from "../../routes/types/paginator/BlogPaginatorParams";

export const blogRouter = Router({})

blogRouter.get('/',
    validateBlog.query.searchNameTerm,
    validateBlog.query.sortBy,
    validateBlog.query.sortDirection,
    validatePaginator.pageSize,
    validatePaginator.pageNumber,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithQuery<BlogPaginatorParams>, res: Response<PaginatorResponse<BlogViewModel>>) => {
        const PaginatedBlogList = await blogQueryRepository.findBlogs(req.query);
        res.status(HTTP_STATUSES.OK_200).json(PaginatedBlogList)
    })

blogRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res) => {
    const blog = await blogQueryRepository.findBlog(req.params.id)
    if (!blog) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
    res.status(HTTP_STATUSES.OK_200).json(blog)
})

blogRouter.get('/:id/posts',
    validatePost.query.sortBy,
    validatePost.query.sortDirection,
    validatePaginator.pageSize,
    validatePaginator.pageNumber,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndQuery<{ id: string }, { sortBy: string, sortDirection: string, pageSize: string, pageNumber: string }>, res) => {

        const blog = await blogQueryRepository.findBlog(req.params.id)
        if (!blog) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }

        const {sortBy, sortDirection, pageNumber, pageSize} = req.query
        const paginatedPostList = await postQueryRepository.findPostsByBlogId(req.params.id, sortBy, sortDirection, +pageNumber, +pageSize);

        res.status(HTTP_STATUSES.OK_200).json(paginatedPostList)
    })

blogRouter.post('/',
    authGuardMiddleware,
    validateBlog.body.name,
    validateBlog.body.description,
    validateBlog.body.websiteUrl,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<BlogInputModel>, res) => {
        const newBlog = await blogsService.createBlog(req.body);
        res.status(HTTP_STATUSES.CREATED_201).json(mapBlogToViewModel(newBlog));
    })


blogRouter.post('/:id/posts',
    authGuardMiddleware,
    validatePost.body.title,
    validatePost.body.shortDescription,
    validatePost.body.content,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, BlogPostInputModel>, res) => {
        try {
            const newPost = await postsService.createPostInBlog(req.params.id, req.body);
            res.status(HTTP_STATUSES.CREATED_201).json(mapPostToViewModel(newPost));
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

blogRouter.put('/:id',
    authGuardMiddleware,
    validateBlog.body.name,
    validateBlog.body.description,
    validateBlog.body.websiteUrl,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, BlogInputModel>, res) => {
        const blog = await blogQueryRepository.findBlog(req.params.id);
        if (!blog) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        await blogsService.updateBlog(req.params.id, req.body)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

blogRouter.delete('/:id',
    authGuardMiddleware,
    async (req: RequestWithParams<{ id: string }>, res) => {
        const isBlogDeleted = await blogsService.deleteBlog(req.params.id)
        if (!isBlogDeleted) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        await postRepository.deleteBlogPosts(req.params.id);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })
