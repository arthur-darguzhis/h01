import {Request, Response, Router} from "express";
import {HTTP_STATUSES, RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/requestTypes";
import {postRepository} from "../repository/postRepository";
import {PostViewModel} from "../model/post/PostViewModel";
import {convertPostToViewModel} from "../types/PostType";
import {PostInputModel} from "../model/post/PostInputModel";
import {body} from "express-validator";
import {checkErrorsInRequestDataMiddleware} from "../middlewares/checkErrorsInRequestDataMiddleware";
import {APIErrorResultType} from "../model/apiError/APIErrorResultType";
import {authGuardMiddleware} from "../middlewares/authGuardMiddleware";
import {blogRepository} from "../repository/blogRepository";

export const postsRouter = Router({})

const validateTitleField = body('title').trim().isLength({
    min: 1,
    max: 30
}).withMessage('"title" length should be from 1 to 30');

const validationShortDescriptionField = body('shortDescription').trim().isLength({
    min: 1,
    max: 100
}).withMessage('"shortDescription" length should be from 1 to 100');

const validationContentField = body('content').trim().isLength({
    min: 1,
    max: 1000
}).withMessage('"content" length should be from 1 to 1000');

const validationBlogIdField = body('blogId').custom(async (blogId) => {
    const blog = await blogRepository.getBlogById(blogId);
    if (!blog) {
        throw new Error(`Blog with ID: ${blogId} is not exists`);
    }
    return true;
});

postsRouter.get('/', (req: Request, res: Response<PostViewModel[]>) => {
    res
        .status(HTTP_STATUSES.OK_200)
        .json(
            postRepository.getPosts().map(p => convertPostToViewModel(p))
        )
})

postsRouter.get('/:id', (req: RequestWithParams<{ id: string }>, res) => {
    const post = postRepository.getPostsById(req.params.id)
    post
        ? res.status(HTTP_STATUSES.OK_200).json(convertPostToViewModel(post))
        : res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
})

postsRouter.post('/',
    authGuardMiddleware,
    validateTitleField,
    validationShortDescriptionField,
    validationContentField,
    validationBlogIdField,
    checkErrorsInRequestDataMiddleware,
    (req: RequestWithBody<PostInputModel>, res) => {

        let newPost;
        try {
            newPost = postRepository.createPost(req.body);
        } catch (e) {
            if (e instanceof Error) {
                const apiErrorResult: APIErrorResultType = {
                    errorsMessages: [{
                        field: req.body.blogId,
                        message: e.message
                    }]
                }
                res.status(HTTP_STATUSES.BAD_REQUEST_400).json(apiErrorResult)
                return
            }

            res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
            return
        }

        res.status(HTTP_STATUSES.CREATED_201).json(convertPostToViewModel(newPost));
    })

postsRouter.put('/:id',
    authGuardMiddleware,
    validateTitleField,
    validationShortDescriptionField,
    validationContentField,
    validationBlogIdField,
    checkErrorsInRequestDataMiddleware,
    (req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res) => {

        const post = postRepository.getPostsById(req.params.id);
        if (!post) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }

        try {
            postRepository.updatePostById(req.params.id, req.body)
        } catch (e) {
            if (e instanceof Error) {
                const apiErrorResult: APIErrorResultType = {
                    errorsMessages: [{
                        field: req.body.blogId,
                        message: e.message
                    }]
                }
                res.status(HTTP_STATUSES.BAD_REQUEST_400).json(apiErrorResult)
                return
            }

            res.sendStatus(HTTP_STATUSES.BAD_REQUEST_400)
            return
        }
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

postsRouter.delete('/:id', authGuardMiddleware, (req: RequestWithParams<{ id: string }>, res) => {
    postRepository.deletePostById(req.params.id)
        ? res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        : res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
})
