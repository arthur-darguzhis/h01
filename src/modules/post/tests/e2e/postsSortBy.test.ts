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

    it('send incorrect parameters for "sortBy" and "sortDirection", should return 2 errors', async () => {
        const blogsPaginatorResponse = await request(app)
            .get('/posts/?sortBy=test&sortDirection=test')
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(blogsPaginatorResponse.body.errorsMessages.length).toBe(2)
    });

    it('should return 5 documents sorted by "title" with "asc" direction\'', async () => {
        const blogsResponse = await request(app)
            .get('/posts/?sortBy=title&sortDirection=asc')
            .expect(HTTP_STATUSES.OK_200)

        expect(blogsResponse.body.items.length).toBe(5)
        expect(blogsResponse.body.items[0].title).toBe('1 post')
        expect(blogsResponse.body.items[4].title).toBe('5 post')
    });

    it('should have default sorting by "createdAd" with "desc" direction', async() => {
        const blogsResponse = await request(app)
            .get('/posts')
            .expect(HTTP_STATUSES.OK_200)

        expect(blogsResponse.body.items.length).toBe(5)
        expect(blogsResponse.body.items[0].title).toBe('1 post')
        expect(blogsResponse.body.items[4].title).toBe('5 post')
    })
})
