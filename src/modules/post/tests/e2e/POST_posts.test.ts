import {client, dbConnection} from "../../../../db";
import {blogsService} from "../../../blog/blogs-service";
import {BlogType} from "../../../blog/types/BlogType";
import {PostInputModel} from "../../types/PostInputModel";
import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";

describe('POST -> "/posts"', () => {
    let blog: BlogType;
    let postInputModel: PostInputModel
    beforeAll(async () => {
        await dbConnection.dropDatabase();
        blog = await blogsService.createBlog({
            "name": `1 blog`,
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });

        postInputModel = {
            title: 'Управление состоянием в React',
            shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело',
            content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
            blogId: blog._id,
        }
    });

    afterAll(async () => {
        await client.close();
    })

    it('Should return error if auth credentials are incorrect. Status 401', async () => {
        await request(app)
            .post('/posts')
            .send(postInputModel)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('Should return error if passed body is incorrect. Status 400', async () => {
        const postInputModel: PostInputModel = {
            title: '',
            shortDescription: '',
            content: '',
            blogId: '',
        }

        const createPostBadResponse = await request(app)
            .post('/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(postInputModel)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(createPostBadResponse.body).toEqual({
            errorsMessages: expect.any(Array)
        })
        expect(createPostBadResponse.body.errorsMessages.length).toBe(4)
    })

    it('Should create new blog. Status 201', async () => {
        const createPostResponse = await request(app)
            .post('/posts')
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
