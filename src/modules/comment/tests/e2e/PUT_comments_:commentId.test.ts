import {blogsService} from "../../../blog/blogs-service";
import {postsService} from "../../../post/posts-service";
import {usersService} from "../../../user/users-service";
import {LoginInputModel} from "../../../auth/types/LoginInputModel";
import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";
import {CommentInputModel} from "../../types/CommentInputModel";
import {client, dbConnection} from "../../../../db";
import {BlogType} from "../../../blog/types/BlogType";
import {PostType} from "../../../post/types/PostType";

describe('PUT -> /comments/:commentId', () => {
    let blog: BlogType;
    let post: PostType;
    let token: string;
    let commentId: string;
    let someUserToken: string;
    let someUserCommentId: string;

    beforeAll(async () => {
        await dbConnection.dropDatabase();

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

    it('Should return error if auth credentials are incorrect. Status 401', async () => {
        await request(app).put('/comments/' + 'commentId')
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('Should return error if "comment" with :id from uri param is not found. Status 404', async () => {
        const updateComment: CommentInputModel = {
            content: 'this is a correct value for comment'
        }

        await request(app).put('/comments/' + '63d11d1562ede10be4f024ad')
            .auth(token, {type: "bearer"})
            .send(updateComment)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('Should return error if passed body is incorrect. Status 400', async () => {
        const updateComment: CommentInputModel = {
            content: 'this is a correct value for comment'
        }

        await request(app).put('/comments/' + someUserCommentId)
            .auth(token, {type: "bearer"})
            .send(updateComment)
            .expect(HTTP_STATUSES.FORBIDDEN_403)
    })

    it('Should return error if user try to update a comment that is not it`s own. Status 403', async () => {
        const updateComment: CommentInputModel = {
            content: 'this is a correct value for comment'
        }
        await request(app).put('/comments/' + someUserCommentId)
            .auth(token, {type: "bearer"})
            .send(updateComment)
            .expect(HTTP_STATUSES.FORBIDDEN_403)
    })

    it('Should update comment by id. Status 204', async () => {
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