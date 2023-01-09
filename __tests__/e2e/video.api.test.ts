import request from 'supertest'
import {app} from '../../src/'
import {HTTP_STATUSES} from '../../src/types/requestTypes'
import {CreateVideoInputModel} from "../../src/model/video/dto/CreateVideoInputModel";
import {UpdateVideoInputModel} from "../../src/model/video/dto/UpdateVideoInputModel";
import {ResolutionType} from "../../src/model/video/ResolutionType";

describe('/videos', () => {
    beforeAll(async () => {
        await request(app).delete('/testing/all-data');
    });

    it('should return 200 and empty array', async () => {
        await request(app)
            .get('/videos')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    it('should return 404 for not existing video', async () => {
        await request(app)
            .get('/videos/1')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should not create video with incorrect input data', async () => {
        const createVideoInputModel: CreateVideoInputModel = {
            title: '',
            author: '',
            availableResolutions: ["P147" as ResolutionType]
        }

        const createVideoBadResponse = await request(app)
            .post('/videos')
            .send(createVideoInputModel)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(createVideoBadResponse.body).toEqual({
            errorsMessages: expect.any(Array)
        })
        expect(createVideoBadResponse.body.errorsMessages.length).toBe(3)

        await request(app)
            .get('/videos')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    let firstVideo: any = null;
    it('should create video with correct input data', async () => {
        const createVideoInputModel: CreateVideoInputModel = {
            title: 'some song',
            author: 'some singer',
            availableResolutions: [
                ResolutionType.P144
            ]
        }

        const createVideoResponse = await request(app)
            .post('/videos')
            .send(createVideoInputModel)
            .expect(HTTP_STATUSES.CREATED_201)

        firstVideo = createVideoResponse.body;
        expect(firstVideo).toEqual({
            id: expect.any(Number),
            title: 'some song',
            author: 'some singer',
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: expect.any(String),
            publicationDate: expect.any(String),
            availableResolutions: [
                "P144"
            ]
        })
    })

    let secondVideo: any = null;
    it('create one more video', async () => {
        const createVideoInputModel: CreateVideoInputModel = {
            title: 'second song',
            author: 'second singer',
            availableResolutions: [
                ResolutionType.P144
            ]
        }

        const createVideoResponse = await request(app)
            .post('/videos')
            .send(createVideoInputModel)
            .expect(HTTP_STATUSES.CREATED_201)

        secondVideo = createVideoResponse.body
        expect(secondVideo).toEqual({
            id: expect.any(Number),
            title: 'second song',
            author: 'second singer',
            canBeDownloaded: false,
            minAgeRestriction: null,
            createdAt: expect.any(String),
            publicationDate: expect.any(String),
            availableResolutions: [
                "P144"
            ]
        })
    })

    it('should not update video with incorrect data', async () => {
        const updateVideoInputModel = {
            title: '',
            author: '',
            canBeDownloaded: 'string',
            minAgeRestriction: 20,
            publicationDate: 100,
            availableResolutions: ['P146']
        };

        const notUpdatedVideoResponse = await request(app)
            .put('/videos/' + secondVideo.id)
            .send(updateVideoInputModel)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(notUpdatedVideoResponse.body).toEqual({
            errorsMessages: expect.any(Array)
        })
        expect(notUpdatedVideoResponse.body.errorsMessages.length).toBe(6)
    })

    it('should not update video that is not exists', async () => {
        const updateVideoInputModel = {
            title: 'updated title',
            author: 'updated author',
            canBeDownloaded: true,
            minAgeRestriction: 18,
            publicationDate: new Date().toISOString(),
            availableResolutions: ['P146']
        };
        await request(app)
            .put('/video/' + -100)
            .send(updateVideoInputModel)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should update video with correct input data', async () => {
        const updateVideoInputModel: UpdateVideoInputModel = {
            "title": "updated title44",
            "author": "autho22",
            "canBeDownloaded": false,
            "publicationDate": new Date().toISOString(),
            "minAgeRestriction": 16,
            "availableResolutions": [ResolutionType.P144]
        }

        await request(app)
            .put('/videos/' + secondVideo.id)
            .send(updateVideoInputModel)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/videos/' + secondVideo.id)
            .expect(HTTP_STATUSES.OK_200, {
                ...secondVideo,
                ...updateVideoInputModel
            })

        await request(app)
            .get('/videos/' + secondVideo.id)
            .expect(HTTP_STATUSES.OK_200, {...secondVideo, ...updateVideoInputModel})
    })

    it('should delete both videos', async () => {
        await request(app)
            .delete('/videos/' + firstVideo.id)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/videos/' + firstVideo.id)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .delete('/videos/' + secondVideo.id)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/videos/' + secondVideo.id)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .get('/videos')
            .expect(HTTP_STATUSES.OK_200, [])
    })
});
