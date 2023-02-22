import {Router} from "express";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {authGuardMiddleware} from "../auth/middlewares/authGuardMiddleware";
import {validatePaginator} from "../../common/middlewares/validatePaginator";
import {validateBlog} from "./middlewares/validateBlog";
import {validatePost} from "../post/middlewares/validatePost";
import {container} from "../../common/compositon-root";
import {BlogController} from "./blogController";

export const blogRouter = Router({})

const blogController = container.resolve(BlogController)

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
