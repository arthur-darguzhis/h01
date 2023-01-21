import request from "supertest";
import {app} from "../../../../src";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {blogRepository} from "../../../../src/repository/blogMongoDbRepository";
import {blogsService} from "../../../../src/domain/service/blogs-service";

describe('/blogs', () => {
    beforeAll(async () => {
        await blogRepository.deleteAllBlogs();
        await blogsService.createBlog({
            "name": "1 blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
        await blogsService.createBlog({
            "name": "2 blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
        await blogsService.createBlog({
            "name": "3 blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
        await blogsService.createBlog({
            "name": "4 blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
        await blogsService.createBlog({
            "name": "5 blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
    });

    it('send incorrect parameters for "pageNumber" and "pageSize". should fail with 2 errors', async () => {
        const blogsPaginatorResponse = await request(app)
            .get('/blogs/?searchNameTerm=blog&pageNumber=-1&pageSize=-1')
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(blogsPaginatorResponse.body.errorsMessages.length).toBe(2)
    });

    it('end request to take documents from 3 page when pageSize is equal 2, should return blogsPaginator shape data', async () => {
        const blogsPaginatorResponse = await request(app)
            .get('/blogs/?searchNameTerm=blog&pageNumber=3&pageSize=2')
            .expect(HTTP_STATUSES.OK_200)

        expect(blogsPaginatorResponse.body.pagesCount).toBe(3)
        expect(blogsPaginatorResponse.body.page).toBe(3)
        expect(blogsPaginatorResponse.body.pageSize).toBe(2)
        expect(blogsPaginatorResponse.body.totalCount).toBe(5)
        expect(blogsPaginatorResponse.body.items.length).toBe(1)
    });
})
