import {Request, Response, Router} from "express";
import {HTTP_STATUSES, RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/requestTypes";
import {postRepository} from "../repository/postRepository";
import {PostViewModel} from "../model/post/PostViewModel";
import {convertPostToViewModel} from "../types/PostType";
import {PostInputModel} from "../model/post/PostInputModel";

export const postsRouter = Router({})

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

postsRouter.post('/', (req: RequestWithBody<PostInputModel>, res) => {
    // const APIErrorResult = validateCreateVideoModel(req.body);

    // if (!isValid(APIErrorResult)) {
    //     res.status(HTTP_STATUSES.BAD_REQUEST_400).json(APIErrorResult);
    //     return;
    // }

    const newPost = postRepository.createPost(req.body);
    if(!newPost){
        //TODO вот этот кусок надо как то по умному в валидацию засунуть с проверкой что blog с id существует.
        res.status(HTTP_STATUSES.BAD_REQUEST_400)
        return
    }
    res.status(HTTP_STATUSES.CREATED_201).json(convertPostToViewModel(newPost));
})

postsRouter.put('/:id', (req: RequestWithParamsAndBody<{ id: string }, PostInputModel>, res) => {
    const blog = postRepository.getPostsById(req.params.id);
    if (!blog) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
    }

    // const APIErrorResult = validateUpdateVideoModel(req.body);
    // if (!isValid(APIErrorResult)) {
    //     res.status(HTTP_STATUSES.BAD_REQUEST_400).json(APIErrorResult);
    //     return;
    // }

    postRepository.updatePostById(req.params.id, req.body)
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

postsRouter.delete('/:id', (req: RequestWithParams<{ id: string }>, res) => {
    postRepository.deletePostById(req.params.id)
        ? res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        : res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
})
