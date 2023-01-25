import request from "supertest";
import {app} from "../../../../src";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {blogRepository} from "../../../../src/repository/blogMongoDbRepository";
import {blogsService} from "../../../../src/domain/service/blogs-service";
import {postRepository} from "../../../../src/repository/postMongoDbRepository";
import {PostInputModel} from "../../../../src/routes/inputModels/PostInputModel";
import {blogQueryRepository} from "../../../../src/queryRepository/blogQueryRepository";
import {BlogViewModel} from "../../../../src/queryRepository/types/Blog/BlogViewModel";
import {postsService} from "../../../../src/domain/service/posts-service";

describe('/blogs/:id/post', () => {
    let blogId: string;
    let blog: BlogViewModel;
    beforeAll(async () => {
        await postRepository.deleteAllPosts();
        await blogRepository.deleteAllBlogs();
        blogId = await blogsService.createBlog({
            "name": "new blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
        blog = await blogQueryRepository.findBlog(blogId) as BlogViewModel;

        for (let i = 0; i < 12; i++) {
            const PostInputModel: PostInputModel = {
                title: i+'post title',
                shortDescription: 'description',
                content: 'new post content',
                blogId: blogId,
            }

            await postsService.createPostInBlog(blogId, PostInputModel);
        }
    }, 30000)

    it('send request to take documents paginator with sorted data by "createdAt desc"', async () => {
        const blogsPaginatorResponse = await request(app)
            .get('/blogs/'+blogId+'/posts')
            .expect(HTTP_STATUSES.OK_200)

        expect(blogsPaginatorResponse.body.items.length).toBe(10)
        expect(blogsPaginatorResponse.body).toEqual({
            pagesCount: 2,
            page: 1,
            pageSize: 10,
            totalCount: 12,
            items: expect.any(Array),
        });
    });
})
