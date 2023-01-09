import express from 'express'
import {videosRepository} from "./repository/videosRepository";
import {videosRouter} from "./routes/videos-router";
import {HTTP_STATUSES} from "./types/requestTypes";

export const app = express()
const port = process.env.PORT || 3000

const jsonBodyMiddleware = express.json()
app.use(jsonBodyMiddleware);
app.use('/videos', videosRouter)

app.delete('/testing/all-data', (req, res) => {
    videosRepository.deleteAllVideos();
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
