import {postRepository} from "../../../../src/repository/postMongoDbRepository";
import {commentRepository} from "../../../../src/repository/commentMongoDbRepository";
import {postsService} from "../../../../src/domain/service/posts-service";
import {BlogViewModel} from "../../../../src/queryRepository/types/Blog/BlogViewModel";
import {blogRepository} from "../../../../src/repository/blogMongoDbRepository";
import {blogsService} from "../../../../src/domain/service/blogs-service";
import {blogQueryRepository} from "../../../../src/queryRepository/blogQueryRepository";
import {PostViewModel} from "../../../../src/queryRepository/types/Post/PostViewModel";
import {postQueryRepository} from "../../../../src/queryRepository/postQueryRepository";
import request from "supertest";
import {app} from "../../../../src/server";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {userRepository} from "../../../../src/repository/userMongoDbRepository";
import {usersService} from "../../../../src/domain/service/users-service";
import {LoginInputModel} from "../../../../src/routes/inputModels/LoginInputModel";
import {client} from "../../../../src/db";
import {UserType} from "../../../../src/domain/types/UserType";

describe('/posts/:id/comments', () => {
    let blogId: string;
    let blog: BlogViewModel;
    let postId: string;
    let post: PostViewModel;
    let token: string;
    let user: UserType;
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

        user = await usersService.createUser({
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
    })

    afterAll(async () => {
        await client.close();
    })

    it('get 401 without JWT token', async () => {
        await request(app)
            .post('/posts/' + postId + '/comments')
            .auth('', {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('get 400 when body data are invalid', async () => {
        const postCommentResponse =  await request(app)
            .post('/posts/' + postId + '/comments')
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
            .post('/posts/' + postId + '/comments')
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
