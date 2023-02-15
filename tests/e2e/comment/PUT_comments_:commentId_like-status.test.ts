import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";
import {BlogType} from "../../../src/modules/blog/types/BlogType";
import {PostType} from "../../../src/modules/post/types/PostType";
import {UserType} from "../../../src/modules/user/types/UserType";
import {blogsService} from "../../../src/modules/blog/blogs-service";
import {postsService} from "../../../src/modules/post/posts-service";
import {usersService} from "../../../src/modules/user/users-service";
import {LoginInputModel} from "../../../src/modules/auth/types/LoginInputModel";
import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {LIKE_STATUSES} from "../../../src/modules/comment/types/LikeStatus";

describe('PUT -> /comments/:commentId/like-status', () => {
    let blog: BlogType;
    let post: PostType
    let token: string;
    let user: UserType;
    let commentId: string;

    beforeAll(async () => {
        await cleanDbBeforeTest()

        blog = await blogsService.createBlog({
            "name": `1 blog`,
            "description": "some description",
            "websiteUrl": "https://habr.com/ru/users/AlekDikarev/",
        });

        const postInputModel = {
            title: 'Управление состоянием в React',
            shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело',
            content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
            blogId: blog._id,
        }

        post = await postsService.createPost(postInputModel)

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

        commentId = postCommentResponse.body.id
    })

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('Return status 401. When auth credentials are incorrect.', async () => {
        await request(app).put('/comments/' + commentId + '/like-status')
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('Return status 400. When the inputModel has incorrect values', async () => {
        await request(app).put('/comments/' + commentId + '/like-status')
            .auth(token, {type: "bearer"})
            .send({
                "likeStatus": 'asdf'
            }).expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('Return status 404. When comment with specified id doesn\'t exists', async () => {
        await request(app).put('/comments/63d11d1562ede10be4f024ad/like-status')
            .auth(token, {type: "bearer"})
            .send({
                "likeStatus": LIKE_STATUSES.LIKE
            }).expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('Return status 204. When the inputModel is correct and user make "like" operation', async () => {
        await request(app).put('/comments/' + commentId + '/like-status')
            .auth(token, {type: "bearer"})
            .send({
                "likeStatus": LIKE_STATUSES.LIKE
            }).expect(HTTP_STATUSES.BAD_REQUEST_400);

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
                "createdAt": expect.any(String),
                "likesInfo": {
                    "likesCount": 1,
                    "dislikesCount": 0,
                    "myStatus": LIKE_STATUSES.LIKE
                }
            }
        )
    })

    it('Return status 204. When the inputModel is correct and user make "dislike" operation', async () => {
        await request(app).put('/comments/' + commentId + '/like-status')
            .auth(token, {type: "bearer"})
            .send({
                "likeStatus": LIKE_STATUSES.DISLIKE
            }).expect(HTTP_STATUSES.BAD_REQUEST_400)

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
                "createdAt": expect.any(String),
                "likesInfo": {
                    "likesCount": 0,
                    "dislikesCount": 1,
                    "myStatus": LIKE_STATUSES.DISLIKE
                }
            }
        )
    })

    it('Return status 204. When the inputModel is correct and user make "reset" operation', async () => {
        await request(app).put('/comments/' + commentId + '/like-status')
            .auth(token, {type: "bearer"})
            .send({
                "likeStatus": LIKE_STATUSES.NONE
            }).expect(HTTP_STATUSES.BAD_REQUEST_400)

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
                "createdAt": expect.any(String),
                "likesInfo": {
                    "likesCount": 0,
                    "dislikesCount": 0,
                    "myStatus": LIKE_STATUSES.NONE
                }
            }
        )
    })
})
