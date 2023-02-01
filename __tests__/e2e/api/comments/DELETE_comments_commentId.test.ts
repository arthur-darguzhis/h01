import {postRepository} from "../../../../src/repository/postMongoDbRepository";
import {blogRepository} from "../../../../src/repository/blogMongoDbRepository";
import {commentRepository} from "../../../../src/repository/commentMongoDbRepository";
import {userRepository} from "../../../../src/repository/userMongoDbRepository";
import {blogsService} from "../../../../src/domain/service/blogs-service";
import {postsService} from "../../../../src/domain/service/posts-service";
import {usersService} from "../../../../src/domain/service/users-service";
import {LoginInputModel} from "../../../../src/routes/inputModels/LoginInputModel";
import request from "supertest";
import {app} from "../../../../src/server";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {client} from "../../../../src/db";
import {BlogType} from "../../../../src/domain/types/BlogType";
import {PostType} from "../../../../src/domain/types/PostType";

describe('/posts/:id/comments', () => {
    let blog: BlogType;
    let post: PostType;
    let token: string;
    let commentId: string;
    let someUserToken: string;
    let someUserCommentId: string;

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

        await usersService.createUser({
            "login": "user2",
            "password": "123456",
            "email": "user2@gmail.com"
        }, true)

        const logInputModelForSomeUser: LoginInputModel = {
            "loginOrEmail": "user2",
            "password": "123456"
        }

        const responseSomeUserToken = await request(app)
            .post('/auth/login')
            .send(logInputModelForSomeUser)
            .expect(HTTP_STATUSES.OK_200)
        someUserToken = responseSomeUserToken.body.accessToken;

        const postSomeUserCommentResponse = await request(app)
            .post('/posts/' + post._id + '/comments')
            .auth(someUserToken, {type: "bearer"})
            .send({content: 'this is a sample of a correct comment that can be saved'})
            .expect(HTTP_STATUSES.CREATED_201)
        someUserCommentId = postSomeUserCommentResponse.body.id;


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

        const postCommentResponse = await request(app)
            .post('/posts/' + post._id + '/comments')
            .auth(token, {type: "bearer"})
            .send({content: 'this is a sample of a correct comment that can be saved'})
            .expect(HTTP_STATUSES.CREATED_201)
        commentId = postCommentResponse.body.id;
    })

    afterAll(async () => {
        await client.close();
    })

    it('get 401 UNAUTHORIZED', async () => {
        await request(app).delete('/comments/' + 'commentId')
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('get 404 when try to delete not existent comment', async () => {
        await request(app).delete('/comments/' + '63d11d1562ede10be4f024ad')
            .auth(token, {type: "bearer"})
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('get 403 when user try to remove not his comment', async () => {
        await request(app).delete('/comments/' + someUserCommentId)
            .auth(token, {type: "bearer"})
            .expect(HTTP_STATUSES.FORBIDDEN_403)
    })

    it('get 204 when succesfully delete comment', async () => {
        await request(app).delete('/comments/' + commentId)
            .auth(token, {type: "bearer"})
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })
})
