import {container} from "../../../src/common/compositon-root";
import {BlogsService} from "../../../src/modules/blog/blogsService";
import {Blog} from "../../../src/modules/blog/types/BlogType";
import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";

const blogsService = container.resolve(BlogsService)

describe('GET -> "/blogs/:id"', () => {
    let blog: Blog;
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
