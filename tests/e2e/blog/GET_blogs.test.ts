import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {blogsService} from "../../../src/modules/blog/blogs-service";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";

describe('GET -> "/blogs"', () => {
    beforeAll(async () => {
        await cleanDbBeforeTest()

        for (let i = 1; i <= 5; i++) {
            await blogsService.createBlog({
                "name": `${i} blog`,
                "description": "some description",
                "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
            });
        }
    });

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('Should return error if query params "pageNumber" and "pageSize" are incorrect. Status 400', async () => {
        const blogsPaginatorResponse = await request(app)
            .get('/blogs/?searchNameTerm=blog&pageNumber=-1&pageSize=-1')
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(blogsPaginatorResponse.body.errorsMessages.length).toBe(2)
    });

    it('Should return blogs pagination 3 pages, page size is 2, totalCount 5 documents. Status 200', async () => {
        const blogsPaginatorResponse = await request(app)
            .get('/blogs/?searchNameTerm=blog&pageNumber=3&pageSize=2')
            .expect(HTTP_STATUSES.OK_200)

        expect(blogsPaginatorResponse.body.items.length).toBe(1)
        expect(blogsPaginatorResponse.body).toEqual({
            pagesCount: 3,
            page: 3,
            pageSize: 2,
            totalCount: 5,
            items: expect.any(Array),
        });
    });
})
