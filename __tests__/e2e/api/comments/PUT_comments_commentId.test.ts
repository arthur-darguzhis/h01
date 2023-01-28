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
import {app} from "../../../../src";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {CommentInputModel} from "../../../../src/routes/inputModels/CommentInputModel";

describe('/posts/:id/comments', () => {
    let blogId: string;
    let blog: BlogViewModel;
    let postId: string;
    let post: PostViewModel;
    let token: string;
    let userId: string;
    let commentId: string;
    let someUserId: string;
    let someUserToken: string;
    let someUserCommentId: string;

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


        someUserId = await usersService.createUser({
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
            .post('/posts/' + postId + '/comments')
            .auth(someUserToken, {type: "bearer"})
            .send({content: 'this is a sample of a correct comment that can be saved'})
            .expect(HTTP_STATUSES.CREATED_201)
        someUserCommentId = postSomeUserCommentResponse.body.id;


        userId = await usersService.createUser({
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
            .post('/posts/' + postId + '/comments')
            .auth(token, {type: "bearer"})
            .send({content: 'this is a sample of a correct comment that can be saved'})
            .expect(HTTP_STATUSES.CREATED_201)
        commentId = postCommentResponse.body.id;
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
            "userId": expect.any(String),
            "userLogin": "user1",
            "createdAt": expect.any(String),
        })
    })

})
