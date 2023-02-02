import {postRepository} from "../../post.MongoDbRepository";
import {commentRepository} from "../../../comment/comment.MongoDbRepository";
import {postsService} from "../../../../domain/service/posts-service";
import {blogRepository} from "../../../blog/blog.MongoDbRepository";
import {blogsService} from "../../../../domain/service/blogs-service";
import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../routes/types/HttpStatuses";
import {userRepository} from "../../../user/user.MongoDbRepository";
import {usersService} from "../../../../domain/service/users-service";
import {LoginInputModel} from "../../../../routes/inputModels/LoginInputModel";
import {client} from "../../../../db";
import {UserType} from "../../../../domain/types/UserType";
import {BlogType} from "../../../../domain/types/BlogType";
import {PostType} from "../../../../domain/types/PostType";

describe('/posts/:id/comments', () => {
    let blog: BlogType;
    let post: PostType;
    let token: string;
    let user: UserType;
    beforeAll(async () => {
        await postRepository.deleteAllPosts();
        await blogRepository.deleteAllBlogs();
        await commentRepository.deleteAllComments();
        await userRepository.deleteAllUsers();

        blog = await blogsService.createBlog({
            "name": "first blog",
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });

        post = await postsService.createPost({
            title: '5 post',
            shortDescription: 'short description',
            content: 'some content',
            blogId: blog._id,
            blogName: '1 blog',
        })

        user = await usersService.createUser({
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
    })

    afterAll(async () => {
        await client.close();
    })

    it('get 401 without JWT token', async () => {
        await request(app)
            .post('/posts/' + post._id + '/comments')
            .auth('', {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('get 400 when body data are invalid', async () => {
        const postCommentResponse =  await request(app)
            .post('/posts/' + post._id + '/comments')
            .auth(token, {type: "bearer"})
            .send({content: 'too short'})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(postCommentResponse.body).toEqual({
            errorsMessages: expect.any(Array)
        })

        expect(postCommentResponse.body.errorsMessages.length).toBe(1)
    })

    it('get 404 when post is not exists', async () => {
        await request(app)
            .post('/posts/' + '63d11d1562ede10be4f024ad' + '/comments')
            .auth(token, {type: "bearer"})
            .send({content: 'this is a sample of a correct comment that can be saved'})
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('get 201 and create comment successfully', async () => {
        const postCommentResponse =  await request(app)
            .post('/posts/' + post._id + '/comments')
            .auth(token, {type: "bearer"})
            .send({content: 'this is a sample of a correct comment that can be saved'})
            .expect(HTTP_STATUSES.CREATED_201)

        expect(postCommentResponse.body).toEqual({
            id: expect.any(String),
            content: 'this is a sample of a correct comment that can be saved',
            commentatorInfo: {
                userId: user._id,
                userLogin: 'user1'
            },
            createdAt: expect.any(String)
        })
    })
});
