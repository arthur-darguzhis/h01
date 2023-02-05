import {BlogType} from "../../types/BlogType";
import {client, dbConnection} from "../../../../db";
import {blogsService} from "../../blogs-service";
import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";

describe('DELETE -> "/blogs/:id"', () => {
    let blog: BlogType;

    beforeAll(async () => {
        await dbConnection.dropDatabase()
        blog = await blogsService.createBlog({
            name: 'first blog',
            description: 'the first blog description',
            websiteUrl: 'https://habr.com/ru/users/AlekDikarev/'
        })
    })

    afterAll(async () => {
        await client.close();
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
