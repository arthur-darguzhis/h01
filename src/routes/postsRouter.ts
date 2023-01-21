import {Request, Response, Router} from "express";
import {HTTP_STATUSES, RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "./types/requestTypes";
import {PostViewModel} from "../queryRepository/types/PostViewModel";
import {convertPostToViewModel, postQueryRepository} from "../queryRepository/postQueryRepository";
import {PostInputModel} from "../domain/inputModels/PostInputModel";
import {body} from "express-validator";
import {checkErrorsInRequestDataMiddleware} from "../middlewares/checkErrorsInRequestDataMiddleware";
import {APIErrorResultType} from "./types/apiError/APIErrorResultType";
import {authGuardMiddleware} from "../middlewares/authGuardMiddleware";
import {postsService} from "../domain/service/posts-service";
import {blogQueryRepository} from "../queryRepository/blogQueryRepository";

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
    const blog = await blogQueryRepository.findBlog(blogId);
    if (!blog) {
        throw new Error(`Blog with ID: ${blogId} is not exists`);
    }
    return true;
});

postsRouter.get('/', async (req: Request, res: Response<PostViewModel[]>) => {
    const posts = await postQueryRepository.findPosts();
    const postsViewModel = posts.map(p => convertPostToViewModel(p));
    res.status(HTTP_STATUSES.OK_200).json(postsViewModel)
})

postsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res) => {
    const post = await postQueryRepository.findPost(req.params.id)
    if (!post) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
    res.status(HTTP_STATUSES.OK_200).json(convertPostToViewModel(post))
})

postsRouter.post('/',
    authGuardMiddleware,
    validateTitleField,
    validationShortDescriptionField,
    validationContentField,
    validationBlogIdField,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<PostInputModel>, res) => {

        let newPost;
        try {
            newPost = await postsService.createPost(req.body);
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

        res.status(HTTP_STATUSES.CREATED_201).json(convertPostToViewModel(newPost));
    })

postsRouter.put('/:id',
    authGuardMiddleware,
    validateTitleField,
    validationShortDescriptionField,
    validationContentField,
    validationBlogIdField,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res) => {

        const post = await postQueryRepository.findPost(req.params.id);
        if (!post) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }

        try {
            await postsService.updatePost(req.params.id, req.body)
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
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

postsRouter.delete('/:id', authGuardMiddleware, async (req: RequestWithParams<{ id: string }>, res) => {
    await postsService.deletePost(req.params.id)
        ? res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        : res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
})
