import {blogsService} from "../../../blog/blogs-service";
import {postsService} from "../../../post/posts-service";
import {usersService} from "../../../user/users-service";
import {LoginInputModel} from "../../../auth/types/LoginInputModel";
import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";
import {client, dbConnection} from "../../../../db";
import {UserType} from "../../../user/types/UserType";
import {BlogType} from "../../../blog/types/BlogType";
import {PostType} from "../../../post/types/PostType";

describe('GET -> /comments/:commentId', () => {
    let blog: BlogType;
    let post: PostType;
    let token: string;
    let user: UserType;
    let commentId: string;
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

        user = await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@test.test"
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
