import express from 'express'
import {testingRouter} from "./routes/testingRouter";
import {postsRouter} from "./routes/postsRouter";
import {blogsRouter} from "./routes/blogsRouter";

export const app = express()
const port = process.env.PORT || 3000

const jsonBodyMiddleware = express.json()

app.use(jsonBodyMiddleware);
app.use('/blogs', blogsRouter)
app.use('/posts', postsRouter)
app.use('/testing', testingRouter)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
