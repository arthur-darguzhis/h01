import express, {Request, Response} from 'express'
import {RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "./types";
import {VideoType} from "./dto/VideoType";
import {VideoViewDto} from "./dto/VideoViewDto";
import {VideoIdDto} from "./dto/VideoIdDto";
import {CreateVideoInputModel} from "./dto/CreateVideoInputModel";
import {FieldErrorType} from "./dto/FieldErrorType";
import {APIErrorResultType} from "./dto/APIErrorResultType";
import {UpdateVideoInputModel} from "./dto/UpdateVideoInputModel";

export const app = express()
const port = process.env.PORT || 3000

export const HTTP_STATUSES = {
    OK_200: 200,
    CREATED_201: 201,
    NO_CONTENT_204: 204,

    BAD_REQUEST_400: 400,
    NOT_FOUND_404: 404,
}

const convertVideoToViewDto = (video: VideoType): VideoViewDto => {
    return {
        id: video.id,
        title: video.title,
        author: video.author,
        canBeDownloaded: video.canBeDownloaded,
        minAgeRestriction: video.minAgeRestriction,
        createdAt: video.createdAt,
        publicationDate: video.publicationDate,
        availableResolutions: video.availableResolutions
    }
}

const jsonBodyMiddleware = express.json()
//прежде чем отправлять req в хендлеры, пожалуйста выполни над req вот такое преобразование.
app.use(jsonBodyMiddleware);

const db: { videos: VideoType[] } = {
    videos: [
        {
            id: 1,
            title: "first video",
            author: "first operator",
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: "2023-01-01T14:44:05.254Z",
            publicationDate: "2023-01-01T14:44:05.254Z",
            availableResolutions: [
                "P144"
            ]
        },
        {
            id: 2,
            title: "second video",
            author: "second operator",
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: "2023-01-02T14:44:05.254Z",
            publicationDate: "2023-01-02T14:44:05.254Z",
            availableResolutions: [
                "P144"
            ]
        },
        {
            id: 3,
            title: "third video",
            author: "third operator",
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: "2023-01-03T14:44:05.254Z",
            publicationDate: "2023-01-03T14:44:05.254Z",
            availableResolutions: [
                "P144"
            ]
        },
        {
            id: 4,
            title: "fourth video",
            author: "fourth operator",
            canBeDownloaded: true,
            minAgeRestriction: null,
            createdAt: "2023-01-04T14:44:05.254Z",
            publicationDate: "2023-01-04T14:44:05.254Z",
            availableResolutions: [
                "P144"
            ]
        },
    ]

}

app.delete('/ht_01/api/testing/all_data', (req, res) => {
    db.videos = [];
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.delete('/hometask_01/api/videos/:id', (req: RequestWithParams<VideoIdDto>, res) => {
    const videoIndex = db.videos.findIndex((v) => v.id === +req.params.id);

    if (videoIndex === -1) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
    }

    db.videos.splice(videoIndex, 1);

    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
})

app.get('/hometask_01/api/videos', (req: Request, res: Response<VideoViewDto[]>) => {
    res
        .status(HTTP_STATUSES.OK_200)
        .json(db.videos.map(v => convertVideoToViewDto(v)))
})

app.get('/hometask_01/api/videos/:id', (req: RequestWithParams<VideoIdDto>, res: Response<VideoViewDto>) => {
    const video = db.videos.find((v) => v.id === +req.params.id);

    if (!video) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
    }

    res
        .status(HTTP_STATUSES.OK_200)
        .json(convertVideoToViewDto(video))
})

app.post('/hometask_01/api/videos', (req: RequestWithBody<CreateVideoInputModel>, res) => {
    const APIErrorResult: APIErrorResultType = {
        errorsMessages: []
    }

    if (!req.body.title) {
        const titleFieldError: FieldErrorType = {
            message: 'should not be blank',
            field: 'title'
        }
        APIErrorResult.errorsMessages.push(titleFieldError)
    } else if (req.body.title.length > 40) {
        const titleFieldError: FieldErrorType = {
            message: 'maxLength is 40 chars',
            field: 'title'
        }
        APIErrorResult.errorsMessages.push(titleFieldError)
    }

    if (!req.body.author) {
        const authorFieldError: FieldErrorType = {
            message: 'should not be blank',
            field: 'author'
        }
        APIErrorResult.errorsMessages.push(authorFieldError)
    } else if (req.body.author.length > 20) {
        const authorFieldError: FieldErrorType = {
            message: 'maxLength is 20 chars',
            field: 'author'
        }
        APIErrorResult.errorsMessages.push(authorFieldError)
    }

    if (req.body.availableResolutions) {
        const hasOnlyAvailableResolutions = req.body.availableResolutions.every((r) => ['P144', 'P240', 'P360', 'P480', 'P720', 'P1080', 'P1440', 'P2160'].includes(r))
        if (!hasOnlyAvailableResolutions) {
            const availableResolutionsFieldError: FieldErrorType = {
                message: 'Data has unavailable resolution',
                field: 'availableResolutions'
            }
            APIErrorResult.errorsMessages.push(availableResolutionsFieldError);
        }

        if (req.body.availableResolutions.length === 0) {
            const availableResolutionsFieldError: FieldErrorType = {
                message: 'At least one resolution should be added',
                field: 'availableResolutions'
            }
            APIErrorResult.errorsMessages.push(availableResolutionsFieldError);
        }
    }

    if (APIErrorResult.errorsMessages.length > 0) {
        res
            .status(HTTP_STATUSES.BAD_REQUEST_400)
            .json(APIErrorResult);
        return;
    }

    const today = new Date()
    const tomorrow = new Date(today.getDay() + 1)

    const newVideo: VideoType = {
        id: new Date().getTime(),
        title: req.body.title,
        author: req.body.author,
        canBeDownloaded: false,
        minAgeRestriction: null,
        createdAt: today.toISOString(),
        publicationDate: tomorrow.toISOString(),
        availableResolutions: req.body.availableResolutions
    }

    db.videos.push(newVideo)

    res
        .status(HTTP_STATUSES.CREATED_201)
        .json(convertVideoToViewDto(newVideo));
})

app.put('/hometask_01/api/videos/:id', (req: RequestWithParamsAndBody<VideoIdDto, UpdateVideoInputModel>, res) => {
    const id = +req.params.id;
    const videoIndex = db.videos.findIndex(v => v.id === id);
    if (videoIndex === -1) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
    }

    const APIErrorResult: APIErrorResultType = {
        errorsMessages: []
    }

    if (!req.body.title) {
        const titleFieldError: FieldErrorType = {
            message: 'should not be blank',
            field: 'title'
        }
        APIErrorResult.errorsMessages.push(titleFieldError)
    } else if (req.body.title.length > 40) {
        const titleFieldError: FieldErrorType = {
            message: 'maxLength is 40 chars',
            field: 'title'
        }
        APIErrorResult.errorsMessages.push(titleFieldError)
    }

    if (!req.body.author) {
        const authorFieldError: FieldErrorType = {
            message: 'should not be blank',
            field: 'author'
        }
        APIErrorResult.errorsMessages.push(authorFieldError)
    } else if (req.body.author.length > 20) {
        const authorFieldError: FieldErrorType = {
            message: 'maxLength is 20 chars',
            field: 'author'
        }
        APIErrorResult.errorsMessages.push(authorFieldError)
    }

    if (req.body.minAgeRestriction
        && (req.body.minAgeRestriction < 1 || req.body.minAgeRestriction > 18)
    ) {
        const minAgeRestrictionFieldError: FieldErrorType = {
            message: 'correct value is between 1 and 18',
            field: 'minAgeRestriction'
        }
        APIErrorResult.errorsMessages.push(minAgeRestrictionFieldError)
    }

    if (req.body.availableResolutions) {
        const hasOnlyAvailableResolutions = req.body.availableResolutions.every((r) => ['P144', 'P240', 'P360', 'P480', 'P720', 'P1080', 'P1440', 'P2160'].includes(r))
        if (!hasOnlyAvailableResolutions) {
            const availableResolutionsFieldError: FieldErrorType = {
                message: 'Data has unavailable resolution',
                field: 'availableResolutions'
            }
            APIErrorResult.errorsMessages.push(availableResolutionsFieldError);
        }

        if (req.body.availableResolutions.length === 0) {
            const availableResolutionsFieldError: FieldErrorType = {
                message: 'At least one resolution should be added',
                field: 'availableResolutions'
            }
            APIErrorResult.errorsMessages.push(availableResolutionsFieldError);
        }
    }

    if (APIErrorResult.errorsMessages.length > 0) {
        res
            .status(HTTP_STATUSES.BAD_REQUEST_400)
            .json(APIErrorResult);
        return;
    }
    const video = db.videos[videoIndex]
    db.videos[videoIndex] = {...video, ...req.body};


    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
