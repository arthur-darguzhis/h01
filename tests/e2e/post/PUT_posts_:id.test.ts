import {blogsService} from "../../../src/modules/blog/blogsService";
import {postsService} from "../../../src/modules/post/postsService";
import {BlogType} from "../../../src/modules/blog/types/BlogType";
import {Post} from "../../../src/modules/post/types/PostType";
import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {PostInputModel} from "../../../src/modules/post/types/PostInputModel";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";

describe('PUT -> "/posts/:id"', () => {
    let blog: BlogType;
    let post: Post;
    beforeAll(async () => {
        await cleanDbBeforeTest()

        blog = await blogsService.createBlog({
            name: "1 blog",
            description: "some description",
            websiteUrl: "https://habr.com/ru/users/AlekDikarev/",
        })

        post = await postsService.createPost(
            {
                title: '5 post',
                shortDescription: 'short description',
                content: 'some content',
                blogId: blog._id,
                blogName: '1 blog',
            }
        )
    })

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('Should return error if auth credentials are incorrect. Status 401', async () => {
        const updatePostInputModel = {
            title: 'some Title',
            shortDescription: 'some Description',
            content: 'some Content',
            blogId: blog._id
        };

        await request(app)
            .put('/posts/' + post._id)
            .send(updatePostInputModel)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('Should return error if "post" with :id from uri param is not found. Status 404', async () => {
        const updatePostInputModel = {
            title: 'some Title',
            shortDescription: 'some Description',
            content: 'some Content',
            blogId: blog._id
        };
        await request(app)
            .put('/posts/63cee71e288013069a37f2b1')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(updatePostInputModel)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('Should return error if passed body is incorrect. Status 400', async () => {
        const updatePostInputModel = {
            title: '',
            shortDescription: '',
            content: '',
            blogId: '',
        };

        await request(app)
            .put('/posts/' + post._id)
            .auth('admin', 'qwerty', {type: "basic"})
            .send(updatePostInputModel)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('Should update post by id. Status 204', async () => {
        const postInputModel: PostInputModel = {
            title: 'Мощь декораторов TypeScript',
            shortDescription: 'В рамках этой статьи разбирается несколько примеров из реальных проектов',
            content: 'С помощью декораторов мы можем избежать “дублирования” кода, инкапсулировав сквозную функциональность в отдельный модуль. Убрать лишний “шум” в коде, что позволит сфокусироваться автору на бизнес логике приложения.',
            blogId: blog._id
        }

        await request(app)
            .put('/posts/' + post._id)
            .auth('admin', 'qwerty', {type: "basic"})
            .send(postInputModel)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const postResponse = await request(app)
            .get('/posts/' + post._id)
            .expect(HTTP_STATUSES.OK_200)

        expect(postResponse.body).toEqual(
            {
                "id": expect.any(String),
                "title": "Мощь декораторов TypeScript",
                "shortDescription": "В рамках этой статьи разбирается несколько примеров из реальных проектов",
                "content": "С помощью декораторов мы можем избежать “дублирования” кода, инкапсулировав сквозную функциональность в отдельный модуль. Убрать лишний “шум” в коде, что позволит сфокусироваться автору на бизнес логике приложения.",
                "blogId": expect.any(String),
                "blogName": "1 blog",
                "createdAt": expect.any(String),
            }
        )
    })
})
