import {Router} from "express";
import {HTTP_STATUSES} from "../types/requestTypes";
import {blogRepository} from "../repository/blogInMemoryRepository";
import {postRepository} from "../repository/postInMemoryRepository";

export const testingRouter = Router({})

testingRouter.delete('/all-data', (req, res) => {
    postRepository.deleteAllPosts()
    blogRepository.deleteAllBlogs();
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
