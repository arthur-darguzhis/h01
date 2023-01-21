import request from "supertest";
import {app} from "../../../../src";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {blogRepository} from "../../../../src/repository/blogMongoDbRepository";
import {blogsService} from "../../../../src/domain/service/blogs-service";

describe('/blogs', () => {
    beforeAll(async () => {
        await blogRepository.deleteAllBlogs();
        await blogsService.createBlog({
            "name" : "first blog",
            "description" : "some description",
            "websiteUrl" : "https://habr.com/ru/users/AlekDikarev/",
        });
        await blogsService.createBlog({
            "name" : "the First blog",
            "description" : "some description",
            "websiteUrl" : "https://habr.com/ru/users/AlekDikarev/",
        });
        await blogsService.createBlog({
            "name" : "exactly that the FiRsT blog",
            "description" : "some description",
            "websiteUrl" : "https://habr.com/ru/users/AlekDikarev/",
        });
        await blogsService.createBlog({
            "name" : "Arturs blog",
            "description" : "some description",
            "websiteUrl" : "https://habr.com/ru/users/AlekDikarev/",
        });
        await blogsService.createBlog({
            "name" : "Olgas blog",
            "description" : "some description",
            "websiteUrl" : "https://habr.com/ru/users/AlekDikarev/",
        });
    })

    it('should return 5 documents when query param "searchNameTerm" is empty', async () => {
        const blogsResponse = await request(app)
            .get('/blogs/?searchNameTerm=')
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(blogsResponse.body.errorsMessages.length).toBe(1)
    })

    it('Should return 3 case insensitive document where "name" = "first"', async () => {
        const blogsResponse = await request(app)
            .get('/blogs/?searchNameTerm=first')
            .expect(HTTP_STATUSES.OK_200)

        expect(blogsResponse.body.items.length).toBe(3)
    });
})
