import {container} from "../../../src/common/compositon-root";
import {BlogsService} from "../../../src/modules/blog/blogsService";
import {PostsService} from "../../../src/modules/post/postsService";
import {UsersService} from "../../../src/modules/user/usersService";
import {LoginInputModel} from "../../../src/modules/auth/types/LoginInputModel";
import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {User} from "../../../src/modules/user/types/UserType";
import {Blog} from "../../../src/modules/blog/types/BlogType";
import {Post} from "../../../src/modules/post/types/PostType";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";

const blogsService = container.resolve(BlogsService)
const usersService = container.resolve(UsersService)
const postsService = container.resolve(PostsService)

describe('GET -> /comments/:commentId', () => {
    let blog: Blog;
    let post: Post;
    let token: string;
    let user: User;
    let commentId: string;
    beforeAll(async () => {
        await cleanDbBeforeTest()
        // await mongoose.connection.dropDatabase();
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
        await closeTestMongooseConnection()
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
                "createdAt": expect.any(String),
                "likesInfo": {
                    "likesCount": 0,
                    "dislikesCount": 0,
                    "myStatus": "None"
                }
            }
        )
    })
})
