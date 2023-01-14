import {Request, Response, Router} from "express";
import {BlogViewModel} from "../model/blog/BlogViewModel";
import {HTTP_STATUSES, RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/requestTypes";
import {blogRepository} from "../repository/blogInMemoryRepository";
import {convertBlogToViewModel} from "../types/BlogType";
import {BlogInputModel} from "../model/blog/BlogInputModel";
import {body} from "express-validator";
import {checkErrorsInRequestDataMiddleware} from "../middlewares/checkErrorsInRequestDataMiddleware";
import {authGuardMiddleware} from "../middlewares/authGuardMiddleware";

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

blogsRouter.get('/', (req: Request, res: Response<BlogViewModel[]>) => {
    const blogs = blogRepository.getBlogs().map(b => convertBlogToViewModel(b));
    res.status(HTTP_STATUSES.OK_200).json(blogs)
})

blogsRouter.get('/:id', (req: RequestWithParams<{ id: string }>, res) => {
    const blog = blogRepository.getBlogById(req.params.id)
    if (blog) {
        return res.status(HTTP_STATUSES.OK_200).json(convertBlogToViewModel(blog))
    }
    res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
})

blogsRouter.post('/',
    authGuardMiddleware,
    validateNameField,
    validateDescriptionField,
    validateWebsiteUrlField,
    checkErrorsInRequestDataMiddleware,
    (req: RequestWithBody<BlogInputModel>, res) => {
        const newBlog = blogRepository.createBlog(req.body);
        res.status(HTTP_STATUSES.CREATED_201).json(convertBlogToViewModel(newBlog));
    })

blogsRouter.put('/:id',
    authGuardMiddleware,
    validateNameField,
    validateDescriptionField,
    validateWebsiteUrlField,
    checkErrorsInRequestDataMiddleware,
    (req: RequestWithParamsAndBody<{ id: string }, BlogInputModel>, res) => {
        const blog = blogRepository.getBlogById(req.params.id);
        if (!blog) {
            return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        }
        blogRepository.updateBlogById(req.params.id, req.body)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

blogsRouter.delete('/:id', authGuardMiddleware, (req: RequestWithParams<{ id: string }>, res) => {
    if (!blogRepository.deleteBlogById(req.params.id)) {
        return res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
