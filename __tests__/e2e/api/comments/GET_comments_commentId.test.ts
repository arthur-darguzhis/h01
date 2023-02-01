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
import {UserType} from "../../../../src/domain/types/UserType";
import {BlogType} from "../../../../src/domain/types/BlogType";
import {PostType} from "../../../../src/domain/types/PostType";

describe('/posts/:id/comments', () => {
    let blog: BlogType;
    let post: PostType;
    let token: string;
    let user: UserType;
    let commentId: string;
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

    it('get 404 when comment is not exists', async () => {
        await request(app).get('/comments/' + '63d11d1562ede10be4f024ad')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('get 200 and a CommentViewModel', async () => {
        const commentsResponse = await request(app).get('/comments/' + commentId)
            .expect(HTTP_STATUSES.OK_200);

        expect(commentsResponse.body).toEqual(
            {
                "id": expect.any(String),
                "content": "this is a sample of a correct comment that can be saved",
                "commentatorInfo": {
                    "userId": user._id,
                    "userLogin": "user1",
                },
                "createdAt": expect.any(String)
            }
        )
    })
})
