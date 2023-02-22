import {container} from "../../common/compositon-root";
import {Router} from "express";
import {checkErrorsInRequestDataMiddleware} from "../../common/middlewares/checkErrorsInRequestDataMiddleware";
import {authGuardMiddleware} from "../auth/middlewares/authGuardMiddleware";
import {validatePost} from "./middlewares/validatePost";
import {validatePaginator} from "../../common/middlewares/validatePaginator";
import {validateComment} from "../comment/middlewares/validateComment";
import {jwtAuthGuardMiddleware} from "../auth/middlewares/jwtAuthGuardMiddleware";
import {PostController} from "./postController";

export const postRouter = Router({})

const postController = container.resolve(PostController)

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
