import {Request, Response, Router} from "express";
import {
    RequestWithBody,
    RequestWithParams,
    RequestWithParamsAndBody,
    RequestWithParamsAndQuery, RequestWithQuery
} from "./types/RequestTypes";
import {BlogInputModel} from "./inputModels/BlogInputModel";
import {checkErrorsInRequestDataMiddleware} from "../middlewares/checkErrorsInRequestDataMiddleware";
import {authGuardMiddleware} from "../middlewares/authGuardMiddleware";
import {blogsService} from "../domain/service/blogs-service";
import {blogQueryRepository} from "../queryRepository/blogQueryRepository";
import {BlogPaginatorType} from "../queryRepository/types/Blog/BlogPaginatorType";
import {HTTP_STATUSES} from "./types/HttpStatuses";
import {postQueryRepository} from "../queryRepository/postQueryRepository";
import {validatePaginator} from "../middlewares/validators/validatePaginator";
import {validateBlog} from "../middlewares/validators/validateBlog";
import {validatePost} from "../middlewares/validators/validatePost";
import {postsService} from "../domain/service/posts-service";
import {APIErrorResultType} from "./types/apiError/APIErrorResultType";
import {BlogPostInputModel} from "./inputModels/BlogPostInputModel";
import {PostViewModel} from "../queryRepository/types/Post/PostViewModel";
import {BlogViewModel} from "../queryRepository/types/Blog/BlogViewModel";
import {postRepository} from "../repository/postMongoDbRepository";

export const blogsRouter = Router({})

blogsRouter.get('/',
    validateBlog.query.searchNameTerm,
    validateBlog.query.sortBy,
    validateBlog.query.sortDirection,
    validatePaginator.pageSize,
    validatePaginator.pageNumber,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithQuery<{ searchNameTerm: string, sortBy: string, sortDirection: string, pageSize: string, pageNumber: string }>,
           res: Response<BlogPaginatorType>) => {

        const {searchNameTerm, sortBy, sortDirection, pageSize, pageNumber} = req.query
        const blogs = await blogQueryRepository.findBlogs(searchNameTerm, sortBy, sortDirection, +pageNumber, +pageSize);

        res.status(HTTP_STATUSES.OK_200).json(blogs)
    })

blogsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res) => {
    const blog = await blogQueryRepository.findBlog(req.params.id)
    if (!blog) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
    res.status(HTTP_STATUSES.OK_200).json(blog)
})

blogsRouter.get('/:id/posts',
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
        const posts = await postQueryRepository.findPostsByBlogId(req.params.id, sortBy, sortDirection, +pageNumber, +pageSize);

        res.status(HTTP_STATUSES.OK_200).json(posts)
    })

blogsRouter.post('/',
    authGuardMiddleware,
    validateBlog.body.name,
    validateBlog.body.description,
    validateBlog.body.websiteUrl,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<BlogInputModel>, res) => {
        const newBlogId = await blogsService.createBlog(req.body);
        const newBlog = await blogQueryRepository.findBlog(newBlogId) as BlogViewModel;
        res.status(HTTP_STATUSES.CREATED_201).json(newBlog);
    })


blogsRouter.post('/:id/posts',
    authGuardMiddleware,
    validatePost.body.title,
    validatePost.body.shortDescription,
    validatePost.body.content,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, BlogPostInputModel>, res) => {
        try {
            const newPostId = await postsService.createPostInBlog(req.params.id, req.body);
            const newPost = await postQueryRepository.findPost(newPostId) as PostViewModel;
            res.status(HTTP_STATUSES.CREATED_201).json(newPost);
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

blogsRouter.put('/:id',
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

blogsRouter.delete('/:id',
    authGuardMiddleware,
    async (req: RequestWithParams<{ id: string }>, res) => {
        const isBlogDeleted = await blogsService.deleteBlog(req.params.id)
        if (!isBlogDeleted) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        await postRepository.deleteBlogPosts(req.params.id);
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })
