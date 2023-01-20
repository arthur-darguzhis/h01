import {Router} from "express";
import {HTTP_STATUSES} from "./types/requestTypes";
import {postsService} from "../domain/service/posts-service";
import {blogsService} from "../domain/service/blogs-service";

export const testingRouter = Router({})

testingRouter.delete('/all-data', async (req, res) => {
    await postsService.deleteAllPosts()
    await blogsService.deleteAllBlogs();
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
