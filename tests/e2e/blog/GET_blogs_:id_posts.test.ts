import {blogsService} from "../../../src/modules/blog/blogsService";
import {Blog} from "../../../src/modules/blog/types/BlogType";
import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {postsService} from "../../../src/modules/post/postsService";
import {PostInputModel} from "../../../src/modules/post/types/PostInputModel";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";

describe('GET -> "/blogs/:id/posts"', () => {
    let blog: Blog;
    beforeAll(async () => {
        await cleanDbBeforeTest()
        // await mongoose.connection.dropDatabase();

        blog = await blogsService.createBlog({
            "name": "first blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
    });

    afterAll(async () => {
        await closeTestMongooseConnection()
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
