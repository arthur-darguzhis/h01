import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../routes/types/HttpStatuses";
import {blogRepository} from "../../../blog/blog.MongoDbRepository";
import {postsService} from "../../../../domain/service/posts-service";
import {blogsService} from "../../../../domain/service/blogs-service";
import {postRepository} from "../../post.MongoDbRepository";
import {client} from "../../../../db";

describe('/blogs', () => {
    beforeAll(async () => {
        await blogRepository.deleteAllBlogs();
        await postRepository.deleteAllPosts();
        const blog = await blogsService.createBlog({
            name: "1 blog",
            description: "some description",
            websiteUrl: "https://habr.com/ru/users/AlekDikarev/",
        });

        await postsService.createPost({
            title: '5 post',
            shortDescription: 'short description',
            content: 'some content',
            blogId: blog._id,
            blogName: '1 blog',
        });

        await postsService.createPost({
            title: '2 post',
            shortDescription: 'short description',
            content: 'some content',
            blogId: blog._id,
            blogName: '1 blog',
        });

        await postsService.createPost({
            title: '3 post',
            shortDescription: 'short description',
            content: 'some content',
            blogId: blog._id,
            blogName: '1 blog',
        });

        await postsService.createPost({
            title: '4 post',
            shortDescription: 'short description',
            content: 'some content',
            blogId: blog._id,
            blogName: '1 blog',
        });

        await postsService.createPost({
            title: '1 post',
            shortDescription: 'short description',
            content: 'some content',
            blogId: blog._id,
            blogName: '1 blog',
        });
    })

    afterAll(async () => {
        await client.close();
    })

    it('send incorrect parameters for "pageNumber" and "pageSize". should fail with 2 errors', async () => {
        const blogsPaginatorResponse = await request(app)
            .get('/posts/?searchNameTerm=blog&pageNumber=-1&pageSize=-1')
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(blogsPaginatorResponse.body.errorsMessages.length).toBe(2)
    });

    it('send request to take documents from 3 page when pageSize is equal 2, should return postsPaginator shape data', async () => {
        const blogsPaginatorResponse = await request(app)
            .get('/posts/?searchNameTerm=blog&pageNumber=3&pageSize=2')
            .expect(HTTP_STATUSES.OK_200)

        expect(blogsPaginatorResponse.body.items.length).toBe(1)
        expect(blogsPaginatorResponse.body).toEqual({
            pagesCount: 3,
            page: 3,
            pageSize: 2,
            totalCount: 5,
            items: expect.any(Array),
        });
    });
})