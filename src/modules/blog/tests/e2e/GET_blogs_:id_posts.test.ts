import {client, dbConnection} from "../../../../db";
import {blogsService} from "../../blogs-service";
import {BlogType} from "../../types/BlogType";
import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";
import {postsService} from "../../../post/posts-service";
import {PostInputModel} from "../../../post/types/PostInputModel";

describe('GET -> "/blogs/:id/posts"', () => {
    let blog: BlogType;
    beforeAll(async () => {
        await dbConnection.dropDatabase();

        blog = await blogsService.createBlog({
            "name": "first blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
    });

    afterAll(async () => {
        await client.close();
    })

    it('Status 200', async () => {
        const postInputModel: PostInputModel = {
            title: 'Управление состоянием в React',
            shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело',
            content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
            blogId: blog._id,
        }

        await postsService.createPostInBlog(blog._id, postInputModel)

        const BlogsPostsResponse = await request(app)
            .get('/blogs/' + blog._id + '/posts')
            .expect(HTTP_STATUSES.OK_200)

        expect(BlogsPostsResponse.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: expect.any(Array),
        });
    })

    it('Should return error if "blog" with :id from uri param is not found. Status 404', async () => {
        await request(app)
            .get('/blogs/63cee71e288013069a37f2b8/posts')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })
})
