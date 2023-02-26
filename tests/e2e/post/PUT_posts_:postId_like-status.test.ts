import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";
import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {Blog} from "../../../src/modules/blog/types/BlogType";
import {Post} from "../../../src/modules/post/types/PostType";
import {User} from "../../../src/modules/user/types/UserType";
import {LoginInputModel} from "../../../src/modules/auth/types/LoginInputModel";
import {container} from "../../../src/common/compositon-root";
import {BlogsService} from "../../../src/modules/blog/blogsService";
import {PostsService} from "../../../src/modules/post/postsService";
import {UsersService} from "../../../src/modules/user/usersService";
import {LikeOfComment} from "../../../src/modules/comment/types/LikeOfCommentType";

const blogsService = container.resolve(BlogsService)
const postsService = container.resolve(PostsService)
const usersService = container.resolve(UsersService)

describe('PUT -> /posts/:postId/like-status', () => {

    let blog: Blog;
    let post: Post
    let token: string;
    let user: User;

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
            "login": "user",
            "password": "123456",
            "email": "user@test.test"
        })

        const logInputModel: LoginInputModel = {
            "loginOrEmail": "user",
            "password": "123456"
        }

        const responseWithToken = await request(app)
            .post('/auth/login')
            .send(logInputModel)
            .expect(HTTP_STATUSES.OK_200)
        token = responseWithToken.body.accessToken;
    })


    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('Return status 401. Should return error if auth token is incorrect', async () => {
        await request(app).put('/posts/' + post._id + '/like-status')
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    });

    it('Return status 400. When the inputModel has incorrect values', async () => {
        await request(app).put('/posts/' + post._id + '/like-status')
            .auth(token, {type: "bearer"})
            .send({
                "likeStatus": 'asdf'
            }).expect(HTTP_STATUSES.BAD_REQUEST_400)
    });

    it('Return status 404. Should return error if "post" with :id from uri param is not found', async () => {
        await request(app).put('/posts/63d11d1562ede10be4f024ad/like-status')
            .auth(token, {type: "bearer"})
            .send({
                "likeStatus": LikeOfComment.LIKE_STATUS_OPTIONS.LIKE
            }).expect(HTTP_STATUSES.NOT_FOUND_404)
    });


    it('Return status 204. When the inputModel is correct and user make "like" operation', async () => {
        await request(app).put('/posts/' + post._id + '/like-status')
            .auth(token, {type: "bearer"})
            .send({
                "likeStatus": LikeOfComment.LIKE_STATUS_OPTIONS.LIKE
            }).expect(HTTP_STATUSES.NO_CONTENT_204);

        const postResponse = await request(app).get('/posts/' + post._id)
            .auth(token, {type: "bearer"})
            .expect(HTTP_STATUSES.OK_200);

        expect(postResponse.body).toEqual(
            {
                "id": expect.any(String),
                title: 'Управление состоянием в React',
                shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело',
                content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
                blogId: blog._id,
                blogName: blog.name,
                "createdAt": expect.any(String),
                "extendedLikesInfo": {
                    "likesCount": 1,
                    "dislikesCount": 0,
                    "myStatus": LikeOfComment.LIKE_STATUS_OPTIONS.LIKE,
                    "newestLikes": [{
                        "addedAt": expect.any(String),
                        "userId": user._id,
                        "login": user.login
                    }]
                }
            }
        )
    });

    it('Return status 204. When the inputModel is correct and user make "dislike" operation', async () => {
        await request(app).put('/posts/' + post._id + '/like-status')
            .auth(token, {type: "bearer"})
            .send({
                "likeStatus": LikeOfComment.LIKE_STATUS_OPTIONS.DISLIKE
            }).expect(HTTP_STATUSES.NO_CONTENT_204);

        const postResponse = await request(app).get('/posts/' + post._id)
            .auth(token, {type: "bearer"})
            .expect(HTTP_STATUSES.OK_200);

        expect(postResponse.body).toEqual(
            {
                "id": expect.any(String),
                title: 'Управление состоянием в React',
                shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело',
                content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
                blogId: blog._id,
                blogName: blog.name,
                "createdAt": expect.any(String),
                "extendedLikesInfo": {
                    "likesCount": 0,
                    "dislikesCount": 1,
                    "myStatus": LikeOfComment.LIKE_STATUS_OPTIONS.DISLIKE,
                    "newestLikes": []
                }
            }
        )
    });

    it('Return status 204. When the inputModel is correct and user make "none" operation', async () => {
        await request(app).put('/posts/' + post._id + '/like-status')
            .auth(token, {type: "bearer"})
            .send({
                "likeStatus": LikeOfComment.LIKE_STATUS_OPTIONS.NONE
            }).expect(HTTP_STATUSES.NO_CONTENT_204);

        const postResponse = await request(app).get('/posts/' + post._id)
            .auth(token, {type: "bearer"})
            .expect(HTTP_STATUSES.OK_200);

        expect(postResponse.body).toEqual(
            {
                "id": expect.any(String),
                title: 'Управление состоянием в React',
                shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело',
                content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
                blogId: blog._id,
                blogName: blog.name,
                "createdAt": expect.any(String),
                "extendedLikesInfo": {
                    "likesCount": 0,
                    "dislikesCount": 0,
                    "myStatus": LikeOfComment.LIKE_STATUS_OPTIONS.NONE,
                    "newestLikes": []
                }
            }
        )
    });
})
