import 'express-async-errors';
import express, {Request, Response, NextFunction} from "express";
import {blogRouter} from "./modules/blog/blog.router";
import {postRouter} from "./modules/post/post.router";
import {userRouter} from "./modules/user/user.router";
import {commentRouter} from "./modules/comment/comment.router";
import {testingRouter} from "./modules/testing/testing.router";
import {settings} from "./settings";
import {runDb} from "./db";
import cookieParser from "cookie-parser";
import {authRouter} from "./modules/auth/auth.router";
import {errorHandler} from "./common/managers/error/ErrorHandler";
import {securityRouter} from "./modules/security/security.router";

export const app = express()

app.use(express.json());
app.use(cookieParser())
app.use('/blogs', blogRouter)
app.use('/posts', postRouter)
app.use('/users', userRouter)
app.use('/auth', authRouter)
app.use('/comments', commentRouter)
app.use('/security', securityRouter)
app.use('/testing', testingRouter)

export const startApp = async () => {
    await runDb();
    app.listen(settings.PORT, () => {
        console.log(`Example app listening on port ${settings.PORT}`)
    })
}

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // console.log('Error encountered:', err.message || err);
    next(err);
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    errorHandler.handleError(err, res);
});
