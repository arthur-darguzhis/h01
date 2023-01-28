import express from 'express'
import {testingRouter} from "./routes/testingRouter";
import {postsRouter} from "./routes/postsRouter";
import {blogsRouter} from "./routes/blogsRouter";
import {runDb} from "./db";
import {usersRouter} from "./routes/usersRouter";
import {authRouter} from "./routes/authRouter";
import {commentsRouter} from "./routes/commentsRouter";
import {settings} from "./settings";
import {RequestWithQuery} from "./routes/types/RequestTypes";
import {RegistrationConfirmationCodeModel} from "./routes/types/RegistrationConfirmationCodeModel";

export const app = express()
const port = settings.PORT

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

app.get('/confirm-email', async (req: RequestWithQuery<RegistrationConfirmationCodeModel>, res) => {
    const url = settings.APP_HOST + 'auth/registration-confirmation'
    const result = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({code: req.query.code})
    })

    res.sendStatus(result.status)
})

startApp();
