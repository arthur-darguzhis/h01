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
import {blogsService} from "./blogsService";
import {blogQueryRepository} from "./repository/blog.QueryRepository";
import {HTTP_STATUSES} from "../../common/presentationLayer/types/HttpStatuses";
import {postQueryRepository} from "../post/repository/post.QueryRepository";
import {validatePaginator} from "../../common/middlewares/validatePaginator";
import {validateBlog} from "./middlewares/validateBlog";
import {validatePost} from "../post/middlewares/validatePost";
import {postsService} from "../post/postsService";
import {BlogPostInputModel} from "./types/BlogPostInputModel";
import {mapPostToViewModel} from "../post/post.mapper";
import {mapBlogToViewModel} from "./blog.mapper";
import {PaginatorResponse} from "../auth/types/paginator/PaginatorResponse";
import {BlogViewModel} from "./types/BlogViewModel";
import {BlogPaginatorParams} from "./types/BlogPaginatorParams";
import {PaginatorParams} from "../auth/types/paginator/PaginatorParams";

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
    const blog = await blogQueryRepository.get(req.params.id)
    res.status(HTTP_STATUSES.OK_200).json(blog)
})

blogRouter.get('/:id/posts',
    validatePost.query.sortBy,
    validatePost.query.sortDirection,
    validatePaginator.pageSize,
    validatePaginator.pageNumber,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndQuery<{ id: string }, PaginatorParams>, res) => {
        const paginatedPostList = await postQueryRepository.findPostsByBlogId(req.params.id, req.query);
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
        const newPost = await postsService.createPostInBlog(req.params.id, req.body);
        res.status(HTTP_STATUSES.CREATED_201).json(mapPostToViewModel(newPost));
    })

blogRouter.put('/:id',
    authGuardMiddleware,
    validateBlog.body.name,
    validateBlog.body.description,
    validateBlog.body.websiteUrl,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, BlogInputModel>, res) => {
        await blogsService.updateBlog(req.params.id, req.body)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

blogRouter.delete('/:id', authGuardMiddleware, async (req: RequestWithParams<{ id: string }>, res) => {
    await blogsService.deleteBlog(req.params.id)
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
