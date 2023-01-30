import {BlogViewModel} from "../../../../src/queryRepository/types/Blog/BlogViewModel";
import {PostViewModel} from "../../../../src/queryRepository/types/Post/PostViewModel";
import {postRepository} from "../../../../src/repository/postMongoDbRepository";
import {blogRepository} from "../../../../src/repository/blogMongoDbRepository";
import {commentRepository} from "../../../../src/repository/commentMongoDbRepository";
import {userRepository} from "../../../../src/repository/userMongoDbRepository";
import {blogsService} from "../../../../src/domain/service/blogs-service";
import {blogQueryRepository} from "../../../../src/queryRepository/blogQueryRepository";
import {postsService} from "../../../../src/domain/service/posts-service";
import {postQueryRepository} from "../../../../src/queryRepository/postQueryRepository";
import {usersService} from "../../../../src/domain/service/users-service";
import {LoginInputModel} from "../../../../src/routes/inputModels/LoginInputModel";
import request from "supertest";
import {app} from "../../../../src/server";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {client} from "../../../../src/db";

describe('/posts/:id/comments', () => {
    let blogId: string;
    let blog: BlogViewModel;
    let postId: string;
    let post: PostViewModel;
    let token: string;
    beforeAll(async () => {
        await postRepository.deleteAllPosts();
        await blogRepository.deleteAllBlogs();
        await commentRepository.deleteAllComments();
        await userRepository.deleteAllUsers();

        blogId = await blogsService.createBlog({
            "name": "first blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });
        blog = await blogQueryRepository.findBlog(blogId) as BlogViewModel;

        postId = await postsService.createPost({
            title: '5 post',
            shortDescription: 'short description',
            content: 'some content',
            blogId: blogId,
            blogName: '1 blog',
        })
        post = await postQueryRepository.findPost(postId) as PostViewModel;

        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@gmail.com"
        }, true)

        const logInputModel: LoginInputModel = {
            "loginOrEmail": "user1",
            "password": "123456"
        }

        const responseWithToken = await request(app)
            .post('/auth/login')
            .send(logInputModel)
            .expect(HTTP_STATUSES.OK_200)
        token = responseWithToken.body.accessToken;

        for (let i = 1; i <= 12; i++) {
            await request(app)
                .post('/posts/' + postId + '/comments')
                .auth(token, {type: "bearer"})
                .send({content: 'comment №:' + i + ' this is a sample of a correct comment that can be saved'})
                .expect(HTTP_STATUSES.CREATED_201)
        }
    })

    afterAll(async () => {
        await client.close();
    })

    it('return 404 if there is not blog with ID:63d11d0962ede10be4f024ac', async () => {
        await request(app)
            .get('/posts/63d11d0962ede10be4f024ac/comments')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('return 200 and paginated list of comments', async () => {
        const postsCommentsPaginatorResponse = await request(app)
            .get('/posts/' + postId + '/comments')
            .expect(HTTP_STATUSES.OK_200)

        expect(postsCommentsPaginatorResponse.body.items.length).toBe(10)
        expect(postsCommentsPaginatorResponse.body).toEqual({
            pagesCount: 2,
            page: 1,
            pageSize: 10,
            totalCount: 12,
            items: expect.any(Array),
        });
    })
})
