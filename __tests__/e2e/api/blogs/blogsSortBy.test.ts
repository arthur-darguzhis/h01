import request from "supertest";
import {app} from "../../../../src";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {blogRepository} from "../../../../src/repository/blogMongoDbRepository";
import {blogsService} from "../../../../src/domain/service/blogs-service";

describe('/blogs', () => {
    beforeAll(async () => {
        await blogRepository.deleteAllBlogs();
        await blogsService.createBlog({
            "name": "5 blog",
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
            "name": "1 blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
    })

    it('send incorrect parameters for "sortBy" and "sortDirection", should return 2 errors', async () => {
        const blogsPaginatorResponse = await request(app)
            .get('/blogs/?searchNameTerm=blog&sortBy=test&sortDirection=test')
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(blogsPaginatorResponse.body.errorsMessages.length).toBe(2)
    });

    it('should return 5 documents sorted by "name" with "desc" direction', async () => {
        const blogsResponse = await request(app)
            .get('/blogs/?searchNameTerm=blog&sortBy=name&sortDirection=asc')
            .expect(HTTP_STATUSES.OK_200)


        expect(blogsResponse.body.items.length).toBe(5)
        expect(blogsResponse.body.items[0].name).toBe('1 blog')
        expect(blogsResponse.body.items[3].name).toBe('12 blog')
    });
})
