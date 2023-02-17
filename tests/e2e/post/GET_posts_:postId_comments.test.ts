import {Blog} from "../../../src/modules/blog/types/BlogType";
import {Post} from "../../../src/modules/post/types/PostType";
import {blogsService} from "../../../src/modules/blog/blogsService";
import {postsService} from "../../../src/modules/post/postsService";
import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";
import {usersService} from "../../../src/modules/user/usersService";
import {LoginInputModel} from "../../../src/modules/auth/types/LoginInputModel";

describe('GET -> "/posts/:postId/comments"', () => {
    let blog: Blog;
    let post: Post
    let token: string;

    beforeAll(async () => {
        await cleanDbBeforeTest()

        blog = await blogsService.createBlog({
            "name": `1 blog`,
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });

        post = await postsService.createPost({
            title: 'Управление состоянием в React',
            shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело',
            content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
            blogId: blog._id,
        })

        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@test.test"
        })

        const logInputModel: LoginInputModel = {
            "loginOrEmail": "user1",
            "password": "123456"
        }

        const responseWithToken = await request(app)
            .post('/auth/login')
            .send(logInputModel)
            .expect(HTTP_STATUSES.OK_200)
        token = responseWithToken.body.accessToken;

        for (let i = 1; i <= 12; i++) {
            await request(app)
                .post('/posts/' + post._id + '/comments')
                .auth(token, {type: "bearer"})
                .send({content: 'comment №:' + i + ' this is a sample of a correct comment that can be saved'})
                .expect(HTTP_STATUSES.CREATED_201)
        }
    })

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('Should return error if "post" with :id from uri param is not found. Status 404', async () => {
        await request(app)
            .get('/posts/63d11d0962ede10be4f024ac/comments')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('Status 200', async () => {
        const postsCommentsPaginatorResponse = await request(app)
            .get('/posts/' + post._id + '/comments')
            .auth(token, {type: "bearer"})
            .expect(HTTP_STATUSES.OK_200)

        expect(postsCommentsPaginatorResponse.body.items.length).toBe(10)
        expect(postsCommentsPaginatorResponse.body).toEqual({
            pagesCount: 2,
            page: 1,
            pageSize: 10,
            totalCount: 12,
            items: expect.any(Array),
        });
    })
})
