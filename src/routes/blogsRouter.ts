import {Request, Response, Router} from "express";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "./types/RequestTypes";
import {BlogInputModel} from "./inputModels/BlogInputModel";
import {checkErrorsInRequestDataMiddleware} from "../middlewares/checkErrorsInRequestDataMiddleware";
import {authGuardMiddleware} from "../middlewares/authGuardMiddleware";
import {blogsService} from "../domain/service/blogs-service";
import {blogQueryRepository} from "../queryRepository/blogQueryRepository";
import {BlogPaginatorType} from "../queryRepository/types/BlogPaginatorType";
import {HTTP_STATUSES} from "./types/HttpStatuses";
import {postQueryRepository} from "../queryRepository/postQueryRepository";
import {validatePaginator} from "../middlewares/validators/validatePaginator";
import {validateBlog} from "../middlewares/validators/validateBlog";
import {validatePost} from "../middlewares/validators/validatePost";
import {postsService} from "../domain/service/posts-service";
import {APIErrorResultType} from "./types/apiError/APIErrorResultType";
import {PostInputModel} from "./inputModels/PostInputModel";

export const blogsRouter = Router({})

blogsRouter.get('/',
    validateBlog.query.searchNameTerm,
    validateBlog.query.sortBy,
    validateBlog.query.sortDirection,
    validatePaginator.pageSize,
    validatePaginator.pageNumber,
    checkErrorsInRequestDataMiddleware,
    async (req: Request, res: Response<BlogPaginatorType>) => {
        const searchNameTerm: string | null = req.query.searchNameTerm ? req.query.searchNameTerm.toString() : null;
        const sortBy: string = req.query.sortBy ? req.query.sortBy.toString() : 'createdAt';
        const sortDirection: string = req.query.sortDirection ? req.query.sortDirection.toString() : 'asc';
        const pageNumber: number = req.query.pageNumber ? +req.query.pageNumber : 1;
        const pageSize: number = req.query.pageSize ? +req.query.pageSize : 10;

        const blogs = await blogQueryRepository.findBlogs(searchNameTerm, sortBy, sortDirection, pageNumber, pageSize);

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
    validateBlog.query.sortBy,
    validateBlog.query.sortDirection,
    validatePaginator.pageSize,
    validatePaginator.pageNumber,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParams<{ id: string }>, res) => {

        const blog = await blogQueryRepository.findBlog(req.params.id)
        if (!blog) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        }

        const sortBy: string = req.query.sortBy ? req.query.sortBy.toString() : 'createdAt';
        const sortDirection: string = req.query.sortDirection ? req.query.sortDirection.toString() : 'asc';
        const pageNumber: number = req.query.pageNumber ? +req.query.pageNumber : 1;
        const pageSize: number = req.query.pageSize ? +req.query.pageSize : 10;

        const posts = await postQueryRepository.findPostsByBlogId(req.params.id, sortBy, sortDirection, pageNumber, pageSize);
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
        const newBlog = await blogQueryRepository.findBlog(newBlogId);
        if (!newBlog) {
            return res.status(HTTP_STATUSES.UNPROCESSABLE_ENTITY)
        }
        res.status(HTTP_STATUSES.CREATED_201).json(newBlog);
    })


blogsRouter.post('/:id/posts',
    authGuardMiddleware,
    validatePost.body.title,
    validatePost.body.shortDescription,
    validatePost.body.content,
    // validatePost.body.blogId,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res) => {
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

blogsRouter.delete('/:id', authGuardMiddleware, async (req: RequestWithParams<{ id: string }>, res) => {
    const isBlogDeleted = await blogsService.deleteBlog(req.params.id)
    if (!isBlogDeleted) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
