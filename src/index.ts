import express from 'express'
import {testingRouter} from "./routes/testingRouter";
import {postsRouter} from "./routes/postsRouter";
import {blogsRouter} from "./routes/blogsRouter";
import {runDb} from "./db";
import {usersRouter} from "./routes/usersRouter";
import {authRouter} from "./routes/authRouter";
import {commentsRouter} from "./routes/commentsRouter";

export const app = express()
const port = process.env.PORT || 3000

const jsonBodyMiddleware = express.json()

app.use(jsonBodyMiddleware);
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/comments', commentsRouter)
app.use('/testing', testingRouter)

const startApp = async () => {
    await runDb();
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`)
    })
}

startApp();
