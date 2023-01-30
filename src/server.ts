import express from "express";
import {blogsRouter} from "./routes/blogsRouter";
import {postsRouter} from "./routes/postsRouter";
import {usersRouter} from "./routes/usersRouter";
import {authRouter} from "./routes/authRouter";
import {commentsRouter} from "./routes/commentsRouter";
import {testingRouter} from "./routes/testingRouter";
import {settings} from "./settings";
import {runDb} from "./db";

export const app = express()

app.use(express.json());
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/comments', commentsRouter)
app.use('/testing', testingRouter)

export const startApp = async () => {
    await runDb();
    app.listen(settings.PORT, () => {
        console.log(`Example app listening on port ${settings.PORT}`)
    })
}
