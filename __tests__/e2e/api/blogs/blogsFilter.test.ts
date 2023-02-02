import request from "supertest";
import {app} from "../../../../src/server";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {blogRepository} from "../../../../src/modules/blog/blog.MongoDbRepository";
import {blogsService} from "../../../../src/domain/service/blogs-service";
import {client} from "../../../../src/db";

describe('/blogs', () => {
    beforeAll(async () => {
        await blogRepository.deleteAllBlogs();
        await blogsService.createBlog({
            "name": "first blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
        await blogsService.createBlog({
            "name": "the First blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
        await blogsService.createBlog({
            "name": "exactly that the FiRsT blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
        await blogsService.createBlog({
            "name": "Arturs blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
        await blogsService.createBlog({
            "name": "Olgas blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
    })

    afterAll(async () => {
        await client.close();
    })

    it('should return 0 documents when query param "searchNameTerm" does not match with any blog name', async () => {
        const blogsResponse = await request(app)
            .get('/blogs/?searchNameTerm=qwer')
            .expect(HTTP_STATUSES.OK_200)

        expect(blogsResponse.body.items.length).toBe(0)
    })

    it('Should return 3 case insensitive document where "name" = "first"', async () => {
        const blogsResponse = await request(app)
            .get('/blogs/?searchNameTerm=first')
            .expect(HTTP_STATUSES.OK_200)

        expect(blogsResponse.body.items.length).toBe(3)
    });
})
