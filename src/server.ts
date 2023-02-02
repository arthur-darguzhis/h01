import express from "express";
import {blogRouter} from "./modules/blog/blog.router";
import {postRouter} from "./modules/post/post.router";
import {userRouter} from "./modules/user/user.router";
import {authRouter} from "./routes/authRouter";
import {commentRouter} from "./modules/comment/comment.router";
import {testingRouter} from "./modules/testing/testing.router";
import {settings} from "./settings";
import {runDb} from "./db";
import cookieParser from "cookie-parser";
export const app = express()

app.use(express.json());
app.use(cookieParser())
app.use('/blogs', blogRouter)
app.use('/posts', postRouter)
app.use('/users', userRouter)
app.use('/auth', authRouter)
app.use('/comments', commentRouter)
app.use('/testing', testingRouter)

export const startApp = async () => {
    await runDb();
    app.listen(settings.PORT, () => {
        console.log(`Example app listening on port ${settings.PORT}`)
    })
}
