import {Request, Response, Router} from "express";
import {BlogViewModel} from "../model/blog/BlogViewModel";
import {HTTP_STATUSES, RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/requestTypes";
import {blogRepository} from "../repository/blogRepository";
import {convertBlogToViewModel} from "../types/BlogType";
import {BlogInputModel} from "../model/blog/BlogInputModel";
import {body} from "express-validator";
import {checkErrorsInRequestDataMiddleware} from "../middlewares/checkErrorsInRequestDataMiddleware";

export const blogsRouter = Router({})

const validateNameField = body('name').trim().isLength({
    min: 1,
    max: 15
}).withMessage('"name" length should be from 1 to 15');

const validateDescriptionField = body('description').trim().isLength({
    min: 1,
    max: 500
}).withMessage('"description" length should be from 1 to 500');

const validateWebsiteUrlField = body('websiteUrl').trim()
    .isURL({protocols: ['https']}).withMessage('"websiteUrl" value is not URL')
    .isLength({min: 13, max: 100}).withMessage('"websiteUrl" length should be from 13 to 100');

blogsRouter.get('/', (req: Request, res: Response<BlogViewModel[]>) => {
    res
        .status(HTTP_STATUSES.OK_200)
        .json(
            blogRepository.getBlogs().map(b => convertBlogToViewModel(b))
        )
})

blogsRouter.get('/:id', (req: RequestWithParams<{ id: string }>, res) => {
    const blog = blogRepository.getBlogById(req.params.id)
    blog
        ? res.status(HTTP_STATUSES.OK_200).json(convertBlogToViewModel(blog))
        : res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
})

blogsRouter.post('/',
    validateNameField,
    validateDescriptionField,
    validateWebsiteUrlField,
    checkErrorsInRequestDataMiddleware,
    (req: RequestWithBody<BlogInputModel>, res) => {
        const newBlog = blogRepository.createBlog(req.body);
        res.status(HTTP_STATUSES.CREATED_201).json(convertBlogToViewModel(newBlog));
    })

blogsRouter.put('/:id',
    validateNameField,
    validateDescriptionField,
    validateWebsiteUrlField,
    checkErrorsInRequestDataMiddleware,
    (req: RequestWithParamsAndBody<{ id: string }, BlogInputModel>, res) => {
        const blog = blogRepository.getBlogById(req.params.id);
        if (!blog) {
            res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
            return;
        }

        blogRepository.updateBlogById(req.params.id, req.body)
        res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
    })

blogsRouter.delete('/:id', (req: RequestWithParams<{ id: string }>, res) => {
    blogRepository.deleteBlogById(req.params.id)
        ? res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        : res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
})
