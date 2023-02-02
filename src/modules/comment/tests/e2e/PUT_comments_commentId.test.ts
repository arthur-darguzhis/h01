import {postRepository} from "../../../post/post.MongoDbRepository";
import {blogRepository} from "../../../blog/blog.MongoDbRepository";
import {commentRepository} from "../../comment.MongoDbRepository";
import {userRepository} from "../../../user/user.MongoDbRepository";
import {blogsService} from "../../../../domain/service/blogs-service";
import {postsService} from "../../../../domain/service/posts-service";
import {usersService} from "../../../../domain/service/users-service";
import {LoginInputModel} from "../../../../routes/inputModels/LoginInputModel";
import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../routes/types/HttpStatuses";
import {CommentInputModel} from "../../../../routes/inputModels/CommentInputModel";
import {client} from "../../../../db";
import {BlogType} from "../../../../domain/types/BlogType";
import {PostType} from "../../../../domain/types/PostType";

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
        })

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
        await request(app).put('/comments/' + 'commentId')
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('get 404 when try to update not existent comment', async () => {
        const updateComment: CommentInputModel = {
            content: 'this is a correct value for comment'
        }

        await request(app).put('/comments/' + '63d11d1562ede10be4f024ad')
            .auth(token, {type: "bearer"})
            .send(updateComment)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('get 400 when user try to update comment with invalid content value', async () => {
        const updateComment: CommentInputModel = {
            content: 'this is a correct value for comment'
        }

        await request(app).put('/comments/' + someUserCommentId)
            .auth(token, {type: "bearer"})
            .send(updateComment)
            .expect(HTTP_STATUSES.FORBIDDEN_403)
    })

    it('get 403 when user try to update not his comment', async () => {
        const updateComment: CommentInputModel = {
            content: 'this is a correct value for comment'
        }
        await request(app).put('/comments/' + someUserCommentId)
            .auth(token, {type: "bearer"})
            .send(updateComment)
            .expect(HTTP_STATUSES.FORBIDDEN_403)
    })

    it('get 204 when succesfully update comment', async () => {
        const updateComment: CommentInputModel = {
            content: 'this is a correct value for comment'
        }
        await request(app).put('/comments/' + commentId)
            .auth(token, {type: "bearer"})
            .send(updateComment)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const updatedCommentResponse = await request(app).get('/comments/' + commentId)
            .auth(token, {type: "bearer"})
            .expect(HTTP_STATUSES.OK_200)

        expect(updatedCommentResponse.body).toEqual({
            "id": expect.any(String),
            "content": "this is a correct value for comment",
            "commentatorInfo": {
                "userId": expect.any(String),
                "userLogin": "user1",
            },
            "createdAt": expect.any(String),
        })
    })

})