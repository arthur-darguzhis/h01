import {Request, Response, Router} from "express";
import {BlogViewModel} from "../queryRepository/types/BlogViewModel";
import {HTTP_STATUSES, RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "./types/requestTypes";
import {blogQueryRepository, convertBlogToViewModel} from "../queryRepository/blogQueryRepository";
import {BlogInputModel} from "../domain/inputModels/BlogInputModel";
import {body} from "express-validator";
import {checkErrorsInRequestDataMiddleware} from "../middlewares/checkErrorsInRequestDataMiddleware";
import {authGuardMiddleware} from "../middlewares/authGuardMiddleware";
import {blogsService} from "../domain/service/blogs-service";

export const blogsRouter = Router({})

const validateNameField = body('name').trim().isLength({
    min: 1,
    max: 15
}).withMessage('"name" length should be from 1 to 15');

const validateDescriptionField = body('description').trim().isLength({
    min: 1,
    max: 500
}).withMessage('"description" length should be from 1 to 500');

const validateWebsiteUrlField = body('websiteUrl').trim().custom(websiteUrl => {
    const regex = /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;
    const stringIsUrl = regex.test(websiteUrl);
    if (!stringIsUrl || websiteUrl.length <= 13 || websiteUrl.length >= 100) {
        throw new Error('"websiteUrl" should be valid URL and it\'s length should be from 13 to 100');
    }
    return true;
})

blogsRouter.get('/', async (req: Request, res: Response<BlogViewModel[]>) => {
    const blogs = await blogQueryRepository.findBlogs();
    const blogsViewModels = blogs.map(b => convertBlogToViewModel(b));
    res
        .status(HTTP_STATUSES.OK_200)
        .json(blogsViewModels)
})

blogsRouter.get('/:id', async (req: RequestWithParams<{ id: string }>, res) => {
    const blog = await blogQueryRepository.findBlog(req.params.id)
    if (!blog) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
    }
    res.status(HTTP_STATUSES.OK_200).json(convertBlogToViewModel(blog))
})

blogsRouter.post('/',
    authGuardMiddleware,
    validateNameField,
    validateDescriptionField,
    validateWebsiteUrlField,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<BlogInputModel>, res) => {
        const newBlog = await blogsService.createBlog(req.body);
        res.status(HTTP_STATUSES.CREATED_201).json(convertBlogToViewModel(newBlog));
    })

blogsRouter.put('/:id',
    authGuardMiddleware,
    validateNameField,
    validateDescriptionField,
    validateWebsiteUrlField,
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
