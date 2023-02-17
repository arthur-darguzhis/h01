import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {blogsService} from "../../../src/modules/blog/blogsService";
import {postsService} from "../../../src/modules/post/postsService";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";

describe('GET -> "/posts"', () => {

    beforeAll(async () => {
        await cleanDbBeforeTest()

        const blog = await blogsService.createBlog({
            name: "1 blog",
            description: "some description",
            websiteUrl: "https://habr.com/ru/users/AlekDikarev/",
        });
        for (let i = 1; i <= 5; i++) {
            await postsService.createPost({
                title: `${i} post`,
                shortDescription: 'short description',
                content: 'some content',
                blogId: blog._id,
                blogName: '1 blog',
            });
        }
    });

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('Should return error if query params "pageNumber" and "pageSize" are incorrect. Status 400', async () => {
        const blogsPaginatorResponse = await request(app)
            .get('/posts/?searchNameTerm=blog&pageNumber=-1&pageSize=-1')
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(blogsPaginatorResponse.body.errorsMessages.length).toBe(2)
    })

    it('Should return 3 page of posts pagination when pageSize is 2. Status 200', async () => {
        const blogsPaginatorResponse = await request(app)
            .get('/posts/?searchNameTerm=blog&pageNumber=3&pageSize=2')
            .expect(HTTP_STATUSES.OK_200)

        expect(blogsPaginatorResponse.body.items.length).toBe(1)
        expect(blogsPaginatorResponse.body).toEqual({
            pagesCount: 3,
            page: 3,
            pageSize: 2,
            totalCount: 5,
            items: expect.any(Array),
        });
    })

})
