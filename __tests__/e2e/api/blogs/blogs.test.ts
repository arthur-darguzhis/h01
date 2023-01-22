import request from "supertest";
import {app} from "../../../../src";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {blogRepository} from "../../../../src/repository/blogMongoDbRepository";
import {BlogInputModel} from "../../../../src/routes/inputModels/BlogInputModel";

describe('/blogs', () => {
    beforeAll(async () => {
        await blogRepository.deleteAllBlogs();
    });

    it('should return 200 and empty array', async () => {
        await request(app)
            .get('/blogs')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it('should return 404 for not existing blog', async () => {
        await request(app)
            .get('/blogs/1')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should not create blog with incorrect input data', async () => {
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

    let firstBlog: any = null;
    it('should create blog with correct input data', async () => {
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

        firstBlog = createBlogResponse.body;
        expect(firstBlog).toEqual({
            id: expect.any(String),
            name: 'first blog',
            description: 'the first blog description',
            websiteUrl: 'https://habr.com/ru/users/AlekDikarev/',
            createdAt: expect.any(String),
        })
    })

    it('can not create blog without auth', async () => {
        const blogInputModel: BlogInputModel = {
            name: 'second blog',
            description: 'the second blog description',
            websiteUrl: 'https://habr.com/ru/users/3Dvideo/'
        }

        const createBlogResponse = await request(app)
            .post('/blogs')
            .send(blogInputModel)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    let secondBlog: any = null;
    it('create one more blog', async () => {
        const blogInputModel: BlogInputModel = {
            name: 'second blog',
            description: 'the second blog description',
            websiteUrl: 'https://habr.com/ru/users/3Dvideo/'
        }

        const createBlogResponse = await request(app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(blogInputModel)
            .expect(HTTP_STATUSES.CREATED_201)

        secondBlog = createBlogResponse.body
        expect(secondBlog).toEqual({
            id: expect.any(String),
            name: 'second blog',
            description: 'the second blog description',
            websiteUrl: 'https://habr.com/ru/users/3Dvideo/',
            createdAt: expect.any(String),
        })
    })

    it('should not update blog with incorrect data', async () => {
        const updateBlogInputModel = {
            name: '',
            description: '',
            websiteUrl: ''
        };

        const notUpdatedBlogResponse = await request(app)
            .put('/blogs/' + secondBlog.id)
            .auth('admin', 'qwerty', {type: "basic"})
            .send(updateBlogInputModel)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(notUpdatedBlogResponse.body).toEqual({
            errorsMessages: expect.any(Array)
        })
        expect(notUpdatedBlogResponse.body.errorsMessages.length).toBe(3)
    })

    it('should not update blog that is not exists', async () => {
        const updateBlogInputModel = {
            name: 'second blog',
            description: 'the second blog description',
            websiteUrl: 'https://habr.com/ru/users/3Dvideo/'
        };
        await request(app)
            .put('/blogs/1000')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(updateBlogInputModel)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should not update blog without auth', async () => {
        const blogInputModel: BlogInputModel = {
            name: 'second blog',
            description: 'the second blog description',
            websiteUrl: 'https://habr.com/ru/users/3Dvideo/'
        }

        await request(app)
            .put('/blogs/' + firstBlog.id)
            .send(blogInputModel)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('should update blog with correct input data', async () => {
        const blogInputModel: BlogInputModel = {
            name: 'second blog',
            description: 'the second blog description',
            websiteUrl: 'https://habr.com/ru/users/3Dvideo/'
        }

        await request(app)
            .put('/blogs/' + firstBlog.id)
            .auth('admin', 'qwerty', {type: "basic"})
            .send(blogInputModel)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/blogs/' + firstBlog.id)
            .expect(HTTP_STATUSES.OK_200, {
                ...firstBlog,
                ...blogInputModel
            })
    })

    it('can not delete blog without auth', async () => {
        await request(app)
            .delete('/blogs/' + firstBlog.id)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('should delete both blogs', async () => {
        await request(app)
            .delete('/blogs/' + firstBlog.id)
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/blogs/' + firstBlog.id)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .delete('/blogs/' + secondBlog.id)
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/blogs/' + secondBlog.id)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .get('/blogs')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })
});
