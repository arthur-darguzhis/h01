import {BlogType} from "../../../src/modules/blog/types/BlogType";
import {blogsService} from "../../../src/modules/blog/blogsService";
import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";

describe('DELETE -> "/blogs/:id"', () => {
    let blog: BlogType;

    beforeAll(async () => {
        await cleanDbBeforeTest()
        blog = await blogsService.createBlog({
            name: 'first blog',
            description: 'the first blog description',
            websiteUrl: 'https://habr.com/ru/users/AlekDikarev/'
        })
    })

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('Should return error if auth credentials are incorrect. Status 401', async () => {
        await request(app)
            .delete('/blogs/' + blog._id)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('Should return error if "blog" with :id from uri param is not found. Status 404', async () => {
        await request(app)
            .delete('/blogs/63cee71e288013069a37f2b8')
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('Should delete blog by id. Status 204', async () => {
        await request(app)
            .delete('/blogs/' + blog._id)
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })
})
