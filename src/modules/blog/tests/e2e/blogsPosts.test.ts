import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../routes/types/HttpStatuses";
import {blogRepository} from "../../blog.MongoDbRepository";
import {blogsService} from "../../../../domain/service/blogs-service";
import {postRepository} from "../../../post/post.MongoDbRepository";
import {PostInputModel} from "../../../../routes/inputModels/PostInputModel";
import {client} from "../../../../db";
import {BlogType} from "../../../../domain/types/BlogType";

describe('/blogs/:id/post', () => {
    let blog: BlogType;
    beforeAll(async () => {
        await postRepository.deleteAllPosts();
        await blogRepository.deleteAllBlogs();
        blog = await blogsService.createBlog({
            "name": "first blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
    })

    afterAll(async () => {
        await client.close();
    })

    it('check that blog does not have any posts', async () => {
        await request(app)
            .get('/blogs/' + blog._id + '/posts')
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it('create new posts for blog special blog', async () => {
        const PostInputModel: PostInputModel = {
            title: 'Управление состоянием в React',
            shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело',
            content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
            blogId: blog._id,
        }

        const createPostResponse = await request(app)
            .post('/blogs/' + blog._id + '/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(PostInputModel)
            .expect(HTTP_STATUSES.CREATED_201)

        const createdPost = createPostResponse.body;
        expect(createdPost).toEqual({
            id: expect.any(String),
            title: 'Управление состоянием в React',
            shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело',
            content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
            blogId: blog._id,
            blogName: blog.name,
            createdAt: expect.any(String)
        })
    })

    it('reads posts of blog witch has only one post', async () => {
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

    it('it can not read posts of blog without posts', async () => {
        await request(app)
            .get('/blogs/63cee71e288013069a37f2b8/posts')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })
});
