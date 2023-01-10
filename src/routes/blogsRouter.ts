import {Request, Response, Router} from "express";
import {BlogViewModel} from "../model/blog/BlogViewModel";
import {HTTP_STATUSES, RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/requestTypes";
import {blogRepository} from "../repository/blogRepository";
import {convertBlogToViewModel} from "../types/BlogType";
import {BlogInputModel} from "../model/blog/BlogInputModel";

export const blogsRouter = Router({})

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

blogsRouter.post('/', (req: RequestWithBody<BlogInputModel>, res) => {
    // const APIErrorResult = validateCreateVideoModel(req.body);

    // if (!isValid(APIErrorResult)) {
    //     res.status(HTTP_STATUSES.BAD_REQUEST_400).json(APIErrorResult);
    //     return;
    // }

    const newBlog = blogRepository.createBlog(req.body);
    res.status(HTTP_STATUSES.CREATED_201).json(convertBlogToViewModel(newBlog));
})

blogsRouter.put('/:id', (req: RequestWithParamsAndBody<{ id: string }, BlogInputModel>, res) => {
    const blog = blogRepository.getBlogById(req.params.id);
    if (!blog) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
    }

    // const APIErrorResult = validateUpdateVideoModel(req.body);
    // if (!isValid(APIErrorResult)) {
    //     res.status(HTTP_STATUSES.BAD_REQUEST_400).json(APIErrorResult);
    //     return;
    // }

    blogRepository.updateBlogById(req.params.id, req.body)
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

blogsRouter.delete('/:id', (req: RequestWithParams<{id: string}>, res) => {
    blogRepository.deleteBlogById(req.params.id)
        ? res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        : res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
})
