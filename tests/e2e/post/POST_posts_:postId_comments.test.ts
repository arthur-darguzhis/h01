import {container} from "../../../src/common/compositon-root";
import {BlogsService} from "../../../src/modules/blog/blogsService";
import {PostsService} from "../../../src/modules/post/postsService";
import {Blog} from "../../../src/modules/blog/types/BlogType";
import {Post} from "../../../src/modules/post/types/PostType";
import {UsersService} from "../../../src/modules/user/usersService";
import {LoginInputModel} from "../../../src/modules/auth/types/LoginInputModel";
import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";
import {User} from "../../../src/modules/user/types/UserType";
import {LikeOfComment} from "../../../src/modules/comment/types/LikeOfCommentType";

const blogsService = container.resolve(BlogsService)
const postsService = container.resolve(PostsService)
const usersService = container.resolve(UsersService)


describe('POST -> "/posts/:postId/comments"', () => {
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
    })

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('Should return error if auth credentials are incorrect. Status 401', async () => {
        await request(app)
            .post('/posts/' + post._id + '/comments')
            .auth('', {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('Should return error if "post" with :id from uri param is not found. Status 404', async () => {
        await request(app)
            .post('/posts/' + '63d11d1562ede10be4f024ad' + '/comments')
            .auth(token, {type: "bearer"})
            .send({content: 'this is a sample of a correct comment that can be saved'})
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('Should return error if passed body is incorrect. Status 400', async () => {
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

    it('Should create new comment to the post in a blog. Status 201', async () => {
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
            createdAt: expect.any(String),
            "likesInfo": {
                "dislikesCount": 0,
                "likesCount": 0,
                "myStatus": LikeOfComment.LIKE_STATUS_OPTIONS.NONE,
            },
        })
    })
})
