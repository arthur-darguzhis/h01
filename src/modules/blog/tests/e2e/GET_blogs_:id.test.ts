import {blogsService} from "../../blogs-service";
import {client, dbConnection} from "../../../../db";
import {BlogType} from "../../types/BlogType";
import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";

describe('GET -> "/blogs/:id"',  () => {
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


    it('Should return error if "blog" with :id from uri param is not found. Status 404', async () => {
        await request(app)
            .get('/blogs/63cee71e288013069a37f2b8')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('Should return blog with :id from uri params. Status 200', async () => {
        const blogViewModel = await request(app)
            .get('/blogs/' + blog._id)
            .expect(HTTP_STATUSES.OK_200)

        expect(blogViewModel.body).toEqual({
                id: expect.any(String,),
                name: 'first blog',
                description: 'the first blog description',
                websiteUrl: 'https://habr.com/ru/users/AlekDikarev/',
                createdAt: expect.any(String,),
            }
        )
    })
})
