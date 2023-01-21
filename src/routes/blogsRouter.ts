import {Request, Response, Router} from "express";
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "./types/RequestTypes";
import {BlogInputModel} from "../domain/inputModels/BlogInputModel";
import {body, query} from "express-validator";
import {checkErrorsInRequestDataMiddleware} from "../middlewares/checkErrorsInRequestDataMiddleware";
import {authGuardMiddleware} from "../middlewares/authGuardMiddleware";
import {blogsService} from "../domain/service/blogs-service";
import {blogQueryRepository} from "../queryRepository/blogQueryRepository";
import {BlogPaginatorType} from "../queryRepository/types/BlogPaginatorType";
import {sortDirections} from "./types/SortDirections";
import {HTTP_STATUSES} from "./types/HttpStatuses";

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

const validateSearchNameTermQueryParam = query('searchNameTerm').optional({nullable: true}).trim().notEmpty()

const validateSortByQueryParam = query('sortBy').optional({nullable: true}).trim().notEmpty().custom(sortBy => {
    const allowedFields = ['id', 'name', 'description', 'websiteUrl', 'createdAt'];
    if(!allowedFields.includes(sortBy)){
        throw new Error(`'sortBy' value can be one of: ${allowedFields.toString()}`);
    }
    return true;
})

const validateSortDirectionQueryParam = query('sortDirection').optional({nullable: true}).trim().notEmpty().custom(sortDirection => {
    if(!sortDirections.includes(sortDirection)){
        throw new Error(`'sortDirection' value can be of ${sortDirections.toString()}`);
    }
    return true;
})

const validatePageNumberQueryParam = query('pageNumber').optional({nullable: true}).trim().notEmpty().isInt({min: 1})
const validatePageSizeQueryParam = query('pageSize').optional({nullable: true}).trim().notEmpty().isInt({min: 1})

blogsRouter.get('/',
    validateSearchNameTermQueryParam,
    validateSortByQueryParam,
    validateSortDirectionQueryParam,
    validatePageNumberQueryParam,
    validatePageSizeQueryParam,
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

blogsRouter.post('/',
    authGuardMiddleware,
    validateNameField,
    validateDescriptionField,
    validateWebsiteUrlField,
    checkErrorsInRequestDataMiddleware,
    async (req: RequestWithBody<BlogInputModel>, res) => {
        const newBlogId = await blogsService.createBlog(req.body);
        const newBlog = await blogQueryRepository.findBlog(newBlogId);
        if (!newBlog) {
            return res.status(HTTP_STATUSES.UNPROCESSABLE_ENTITY)
        }
        res.status(HTTP_STATUSES.CREATED_201).json(newBlog);
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
