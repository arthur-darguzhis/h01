import {client, dbConnection} from "../../../../db";
import {BlogInputModel} from "../../types/BlogInputModel";
import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";

describe('POST -> "/blogs"', () => {
    beforeAll(async () => {
        await dbConnection.dropDatabase();
    });

    afterAll(async () => {
        await client.close();
    })

    it('Should return error if auth credentials are incorrect. Status 401', async () => {
        const blogInputModel: BlogInputModel = {
            name: 'second blog',
            description: 'the second blog description',
            websiteUrl: 'https://habr.com/ru/users/3Dvideo/'
        }

        await request(app)
            .post('/blogs')
            .send(blogInputModel)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('Should return error if passed body is incorrect. Status 400', async () => {
        const blogInputModel: BlogInputModel = {
            name: '',
            description: '',
            websiteUrl: ''
        }

        const createBlogBadResponse = await request(app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(blogInputModel)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(createBlogBadResponse.body).toEqual({
            errorsMessages: expect.any(Array)
        })
        expect(createBlogBadResponse.body.errorsMessages.length).toBe(3)

        await request(app)
            .get('/blogs')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it('Should create new blog. Status 201', async () => {
        const blogInputModel: BlogInputModel = {
            name: 'first blog',
            description: 'the first blog description',
            websiteUrl: 'https://habr.com/ru/users/AlekDikarev/'
        }

        const createBlogResponse = await request(app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(blogInputModel)
            .expect(HTTP_STATUSES.CREATED_201)

        expect(createBlogResponse.body).toEqual({
            id: expect.any(String),
            name: 'first blog',
            description: 'the first blog description',
            websiteUrl: 'https://habr.com/ru/users/AlekDikarev/',
            createdAt: expect.any(String),
        })
    })
})
