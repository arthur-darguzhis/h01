import {BlogType} from "../../types/BlogType";
import {client, dbConnection} from "../../../../db";
import {blogsService} from "../../blogs-service";
import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";
import {PostInputModel} from "../../../post/types/PostInputModel";

describe('PUT -> "/blogs/:id/posts"', () => {
    let blog: BlogType;
    let postInputModel: PostInputModel
    beforeAll(async () => {
        await dbConnection.dropDatabase()

        blog = await blogsService.createBlog({
            name: 'first blog',
            description: 'the first blog description',
            websiteUrl: 'https://habr.com/ru/users/AlekDikarev/'
        })

        postInputModel = {
            title: 'Управление состоянием в React',
            shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело',
            content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
            blogId: blog._id,
        }
    })

    afterAll(async () => {
        await client.close();
    })

    it('Should return error if auth credentials are incorrect. Status 401', async () => {
        await request(app)
            .post('/blogs/' + blog._id + '/posts')
            .send(postInputModel)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('Should return error if "blog" with :id from uri param is not found. Status 404', async () => {
        await request(app)
            .post('/blogs/63cee71e288013069a37f2b8/posts')
            .send(postInputModel)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('Should return error if passed body is incorrect. Status 400', async () => {
        const wrongPostInputModel = {
            title: '',
            shortDescription: '',
            content: '',
            blogId: blog._id,
        }

        const createPostResponse = await request(app)
            .post('/blogs/' + blog._id + '/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(wrongPostInputModel)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(createPostResponse.body.errorsMessages.length).toBe(3)
    })

    it('Should create new "post" in blog. Status 201', async () => {
        const createPostResponse = await request(app)
            .post('/blogs/' + blog._id + '/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(postInputModel)
            .expect(HTTP_STATUSES.CREATED_201)

        expect(createPostResponse.body).toEqual({
            id: expect.any(String),
            title: 'Управление состоянием в React',
            shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело',
            content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
            blogId: blog._id,
            blogName: blog.name,
            createdAt: expect.any(String)
        })
    })
})
