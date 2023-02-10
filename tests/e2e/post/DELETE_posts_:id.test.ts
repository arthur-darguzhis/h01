import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {PostType} from "../../../src/modules/post/types/PostType";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";
import {BlogType} from "../../../src/modules/blog/types/BlogType";
import {blogsService} from "../../../src/modules/blog/blogs-service";
import {postsService} from "../../../src/modules/post/posts-service";

describe('DELETE -> "/posts/:id"', () => {
    let blog: BlogType;
    let post: PostType
    beforeAll(async () => {
        await cleanDbBeforeTest()

        blog = await blogsService.createBlog({
            "name": `1 blog`,
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });

        const postInputModel = {
            title: 'Управление состоянием в React',
            shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело',
            content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
            blogId: blog._id,
        }

        post = await postsService.createPost(postInputModel)
    })

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('Should return error if auth credentials are incorrect. Status 401', async () => {
        await request(app)
            .delete('/posts/' + post._id)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('Should return error if "blog" with :id from uri param is not found. Status 404', async () => {
        await request(app)
            .delete('/posts/63cee71e288013069a37f2b8')
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('Should delete blog by id. Status 204', async () => {
        await request(app)
            .delete('/posts/' + post._id)
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })
})
