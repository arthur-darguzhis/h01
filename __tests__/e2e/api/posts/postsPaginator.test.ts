import request from "supertest";
import {app} from "../../../../src";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {blogRepository} from "../../../../src/repository/blogMongoDbRepository";
import {postsService} from "../../../../src/domain/service/posts-service";
import {blogsService} from "../../../../src/domain/service/blogs-service";
import {postRepository} from "../../../../src/repository/postMongoDbRepository";

describe('/blogs', () => {
    beforeAll(async () => {
        await blogRepository.deleteAllBlogs();
        await postRepository.deleteAllPosts();
        const blogId = await blogsService.createBlog({
            name: "1 blog",
            description: "some description",
            websiteUrl: "https://habr.com/ru/users/AlekDikarev/",
        });

        await postsService.createPost({
            title: '5 post',
            shortDescription: 'short description',
            content: 'some content',
            blogId: blogId,
            blogName: '1 blog',
        });

        await postsService.createPost({
            title: '2 post',
            shortDescription: 'short description',
            content: 'some content',
            blogId: blogId,
            blogName: '1 blog',
        });

        await postsService.createPost({
            title: '3 post',
            shortDescription: 'short description',
            content: 'some content',
            blogId: blogId,
            blogName: '1 blog',
        });

        await postsService.createPost({
            title: '4 post',
            shortDescription: 'short description',
            content: 'some content',
            blogId: blogId,
            blogName: '1 blog',
        });

        await postsService.createPost({
            title: '1 post',
            shortDescription: 'short description',
            content: 'some content',
            blogId: blogId,
            blogName: '1 blog',
        });
    })

    it('send incorrect parameters for "pageNumber" and "pageSize". should fail with 2 errorss', async () => {
        const blogsPaginatorResponse = await request(app)
            .get('/posts/?searchNameTerm=blog&pageNumber=-1&pageSize=-1')
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(blogsPaginatorResponse.body.errorsMessages.length).toBe(2)
    });

    it('send request to take documents from 3 page when pageSize is equal 2, should return postsPaginator shape data', async () => {
        const blogsPaginatorResponse = await request(app)
            .get('/posts/?searchNameTerm=blog&pageNumber=3&pageSize=2')
            .expect(HTTP_STATUSES.OK_200)

        expect(blogsPaginatorResponse.body.pagesCount).toBe(3)
        expect(blogsPaginatorResponse.body.page).toBe(3)
        expect(blogsPaginatorResponse.body.pageSize).toBe(2)
        expect(blogsPaginatorResponse.body.totalCount).toBe(5)
        expect(blogsPaginatorResponse.body.items.length).toBe(1)
    });
})
