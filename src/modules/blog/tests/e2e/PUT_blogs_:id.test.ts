import {BlogType} from "../../types/BlogType";
import {client, dbConnection} from "../../../../db";
import {blogsService} from "../../blogs-service";
import {BlogInputModel} from "../../types/BlogInputModel";
import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";

describe('PUT -> "/blogs/:id"', () => {
    let blog: BlogType;
    const updateBlogInputModel: BlogInputModel = {
        name: 'second blog',
        description: 'the second blog description',
        websiteUrl: 'https://habr.com/ru/users/3Dvideo/'
    }

    beforeAll(async () => {
        await dbConnection.dropDatabase()

        blog = await blogsService.createBlog({
            name: 'first blog',
            description: 'the first blog description',
            websiteUrl: 'https://habr.com/ru/users/AlekDikarev/'
        })
    })

    afterAll(async () => {
        await client.close();
    })

    it('Should return error if auth credentials are incorrect. Status 401', async () => {
        await request(app)
            .put('/blogs/' + blog._id)
            .send(updateBlogInputModel)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('Should return error if "blog" with :id from uri param is not found. Status 404', async () => {

        await request(app)
            .put('/blogs/63cee71e288013069a37f2b8')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(updateBlogInputModel)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })


    it('Should return error if passed body is incorrect. Status 400', async () => {
        const updateBlogInputModel = {
            name: '',
            description: '',
            websiteUrl: ''
        };

        const notUpdatedBlogResponse = await request(app)
            .put('/blogs/' + blog._id)
            .auth('admin', 'qwerty', {type: "basic"})
            .send(updateBlogInputModel)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(notUpdatedBlogResponse.body).toEqual({
            errorsMessages: expect.any(Array)
        })

        expect(notUpdatedBlogResponse.body.errorsMessages.length).toBe(3)
    })

    it('Should update blog by id. Status 204', async () => {
        await request(app)
            .put('/blogs/' + blog._id)
            .auth('admin', 'qwerty', {type: "basic"})
            .send(updateBlogInputModel)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const blogResponse = await request(app)
            .get('/blogs/' + blog._id)
            .expect(HTTP_STATUSES.OK_200)

        expect(blogResponse.body).toEqual({
            id: blog._id,
            name: 'second blog',
            description: 'the second blog description',
            websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
            createdAt: expect.any(String)
        })
    })
})