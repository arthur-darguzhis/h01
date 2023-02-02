import {postRepository} from "../../post.MongoDbRepository";
import {blogRepository} from "../../../blog/blog.MongoDbRepository";
import {commentRepository} from "../../../comment/comment.MongoDbRepository";
import {userRepository} from "../../../user/user.MongoDbRepository";
import {blogsService} from "../../../../domain/service/blogs-service";
import {postsService} from "../../../../domain/service/posts-service";
import {usersService} from "../../../../domain/service/users-service";
import {LoginInputModel} from "../../../../routes/inputModels/LoginInputModel";
import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../routes/types/HttpStatuses";
import {client} from "../../../../db";
import {BlogType} from "../../../../domain/types/BlogType";
import {PostType} from "../../../../domain/types/PostType";

describe('/posts/:id/comments', () => {
    let blog: BlogType;
    let post: PostType;
    let token: string;
    beforeAll(async () => {
        await postRepository.deleteAllPosts();
        await blogRepository.deleteAllBlogs();
        await commentRepository.deleteAllComments();
        await userRepository.deleteAllUsers();

        blog = await blogsService.createBlog({
            "name": "first blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        })

        post = await postsService.createPost({
            title: '5 post',
            shortDescription: 'short description',
            content: 'some content',
            blogId: blog._id,
            blogName: '1 blog',
        })

        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@gmail.com"
        })

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
                .post('/posts/' + post._id + '/comments')
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
            .get('/posts/' + post._id + '/comments')
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