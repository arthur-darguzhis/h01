import {Request, Response, Router} from "express";
import {HTTP_STATUSES, RequestWithBody, RequestWithParams, RequestWithParamsAndBody} from "../types/requestTypes";
import {VideoIdDto} from "../model/video/dto/VideoIdDto";
import {convertVideoToOutputModel, VideoOutputModel} from "../model/video/dto/VideoOutputModel";
import {videosRepository} from "../repository/videosRepository";
import {CreateVideoInputModel} from "../model/video/dto/CreateVideoInputModel";
import {isValid, validateCreateVideoModel, validateUpdateVideoModel} from "../validator/VideoModelsValidator";
import {UpdateVideoInputModel} from "../model/video/dto/UpdateVideoInputModel";

export const videosRouter = Router({})

videosRouter.get('/', (req: Request, res: Response<VideoOutputModel[]>) => {
    res
        .status(HTTP_STATUSES.OK_200)
        .json(videosRepository.getVideos().map(v => convertVideoToOutputModel(v)))
})
videosRouter.get('/:id', (req: RequestWithParams<VideoIdDto>, res: Response<VideoOutputModel>) => {
    const video = videosRepository.getVideoById(+req.params.id)
    video
        ? res.status(HTTP_STATUSES.OK_200).json(convertVideoToOutputModel(video))
        : res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
})
videosRouter.post('/', (req: RequestWithBody<CreateVideoInputModel>, res) => {
    const APIErrorResult = validateCreateVideoModel(req.body);

    if (!isValid(APIErrorResult)) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json(APIErrorResult);
        return;
    }

    const newVideo = videosRepository.createVideo(req.body);
    res.status(HTTP_STATUSES.CREATED_201).json(convertVideoToOutputModel(newVideo));
})
videosRouter.put('/:id', (req: RequestWithParamsAndBody<VideoIdDto, UpdateVideoInputModel>, res) => {
    const video = videosRepository.getVideoById(+req.params.id);
    if (!video) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
        return;
    }

    const APIErrorResult = validateUpdateVideoModel(req.body);
    if (!isValid(APIErrorResult)) {
        res.status(HTTP_STATUSES.BAD_REQUEST_400).json(APIErrorResult);
        return;
    }

    videosRepository.updateVideoById(+req.params.id, {...video, ...req.body})
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})
videosRouter.delete('/:id', (req: RequestWithParams<VideoIdDto>, res) => {
    videosRepository.deleteVideoById(+req.params.id)
        ? res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        : res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
})
