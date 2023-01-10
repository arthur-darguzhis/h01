import {Router} from "express";
import {HTTP_STATUSES} from "../types/requestTypes";
import {blogRepository} from "../repository/blogRepository";
import {postRepository} from "../repository/postRepository";

export const testingRouter = Router({})

testingRouter.delete('/all-data', (req, res) => {
    postRepository.deleteAllPosts()
    blogRepository.deleteAllBlogs();
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
