import {Router} from "express";
import {HTTP_STATUSES} from "../types/requestTypes";
import {blogRepository} from "../repository/blogMongoDbRepository";
import {postRepository} from "../repository/postMongoDbRepository";

export const testingRouter = Router({})

testingRouter.delete('/all-data', async (req, res) => {
    await postRepository.deleteAllPosts()
    await blogRepository.deleteAllBlogs();
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
