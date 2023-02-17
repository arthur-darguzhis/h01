import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {blogsService} from "../../../src/modules/blog/blogsService";
import {postsService} from "../../../src/modules/post/postsService";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";

describe('GET -> "/blogs/:id"', () => {
    beforeAll(async () => {
        await cleanDbBeforeTest()
    })

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('Should return error if "post" with :id from uri param is not found. Status 404', async () => {
        await request(app)
            .get('/posts/63cee71e288013069a37f2b8')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('Should return post with :id from uri params. Status 200', async () => {
        const blog = await blogsService.createBlog({
            name: "1 blog",
            description: "some description",
            websiteUrl: "https://habr.com/ru/users/AlekDikarev/",
        })

        const post = await postsService.createPost(
            {
                title: '5 post',
                shortDescription: 'short description',
                content: 'some content',
                blogId: blog._id,
                blogName: '1 blog',
            }
        )
        const getPostResponse = await request(app)
            .get('/posts/'+post._id)
            .expect(HTTP_STATUSES.OK_200)

        expect(getPostResponse.body).toEqual(
            {
                id: expect.any(String),
                title: '5 post',
                shortDescription: 'short description',
                content: 'some content',
                blogId: blog._id,
                blogName: blog.name,
                createdAt: expect.any(String)
            }
        )
    })
})
