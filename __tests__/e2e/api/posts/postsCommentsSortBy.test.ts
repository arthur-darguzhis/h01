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

        for (let i = 1; i <= 12; i++) {
            await request(app)
                .post('/posts/' + post._id + '/comments')
                .auth(token, {type: "bearer"})
                .send({content: 'comment №:' + i + ' this is a sample of a correct comment that can be saved'})
                .expect(HTTP_STATUSES.CREATED_201)
        }
    }, 30000)

    afterAll(async () => {
        await client.close();
    })

    it('return 200 and paginated list of 5 comments sorted by "content"', async () => {
        const postsCommentsPaginatorResponse = await request(app)
            .get('/posts/' + post._id + '/comments/?sortBy=content&sortDirection=asc')
            .expect(HTTP_STATUSES.OK_200)

        expect(postsCommentsPaginatorResponse.body.items.length).toBe(10)
        expect(postsCommentsPaginatorResponse.body).toEqual({
            pagesCount: 2,
            page: 1,
            pageSize: 10,
            totalCount: 12,
            items: expect.any(Array),
        });

        expect(postsCommentsPaginatorResponse.body.items.length).toBe(10)
        expect(postsCommentsPaginatorResponse.body.items[0].content).toMatch('comment №:1')
        expect(postsCommentsPaginatorResponse.body.items[4].content).toMatch('comment №:2')
    })
})
