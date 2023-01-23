import {Router} from "express";
import {HTTP_STATUSES} from "./types/HttpStatuses";
import {postsService} from "../domain/service/posts-service";
import {blogsService} from "../domain/service/blogs-service";
import {usersService} from "../domain/service/users-service";

export const testingRouter = Router({})

testingRouter.delete('/all-data', async (req, res) => {
    await postsService.deleteAllPosts()
    await blogsService.deleteAllBlogs()
    await usersService.deleteAllUsers()
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
