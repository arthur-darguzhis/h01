import {Router} from "express";
import {HTTP_STATUSES} from "../../routes/types/HttpStatuses";
import {postsService} from "../../domain/service/posts-service";
import {blogsService} from "../../domain/service/blogs-service";
import {usersService} from "../../domain/service/users-service";
import {commentsService} from "../../domain/service/comments-service";

export const testingRouter = Router({})

testingRouter.delete('/all-data', async (req, res) => {
    await postsService.deleteAllPosts()
    await blogsService.deleteAllBlogs()
    await usersService.deleteAllUsers()
    await commentsService.deleteAllComments()
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
