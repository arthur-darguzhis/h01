import request from "supertest";
import {app} from "../../src";
import {HTTP_STATUSES} from "../../src/types/requestTypes";
import {BlogInputModel} from "../../src/model/blog/BlogInputModel";
import {PostInputModel} from "../../src/model/post/PostInputModel";
import {postRepository} from "../../src/repository/postRepository";

describe('/posts', () => {
    beforeAll(async () => {
        postRepository.deleteAllPosts()
    });

    it('should return 200 and empty array', async () => {
        await request(app)
            .get('/posts')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    it('should return 404 for not existing posts', async () => {
        await request(app)
            .get('/posts/1')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should not create post with incorrect input data', async () => {
        const postInputModel: PostInputModel = {
            title: '',
            shortDescription: '',
            content: '',
            blogId: '',
        }

        const createPostBadResponse = await request(app)
            .post('/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(postInputModel)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(createPostBadResponse.body).toEqual({
            errorsMessages: expect.any(Array)
        })
        expect(createPostBadResponse.body.errorsMessages.length).toBe(4)

        await request(app)
            .get('/posts')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    let firstBlog: any = null;
    it('should create blog to assign posts ', async () => {
        const blogInputModel: BlogInputModel = {
            name: 'first blog',
            description: 'the first blog',
            websiteUrl: 'https://habr.com/ru/users/AlekDikarev/'
        }

        const createBlogResponse = await request(app)
            .post('/blogs')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(blogInputModel)
            .expect(HTTP_STATUSES.CREATED_201)

        firstBlog = createBlogResponse.body;
        expect(firstBlog).toEqual({
            id: expect.any(String),
            name: 'first blog',
            description: 'the first blog',
            websiteUrl: 'https://habr.com/ru/users/AlekDikarev/'
        })
    })

    it('can not create post without auth', async () => {
        const PostInputModel: PostInputModel = {
            title: 'Управление состоянием в React',
            shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело',
            content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
            blogId: firstBlog.id,
        }

        const createPostResponse = await request(app)
            .post('/posts')
            .send(PostInputModel)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    let firstPost: any = null;
    it('should create post with correct data', async () => {
        const PostInputModel: PostInputModel = {
            title: 'Управление состоянием в React',
            shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело',
            content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
            blogId: firstBlog.id,
        }

        const createPostResponse = await request(app)
            .post('/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(PostInputModel)
            .expect(HTTP_STATUSES.CREATED_201)

        firstPost = createPostResponse.body;
        expect(firstPost).toEqual({
            id: expect.any(String),
            title: 'Управление состоянием в React',
            shortDescription: 'Все мы прекрасно знаем что построить полноценный стор на react context достаточно тяжело',
            content: 'Буквально каждую конференцию мы слышим от спикеров, а вы знаете как работают контексты? а вы знаете что каждый ваш слушатель перерисовывает ваш умный компонент (useContext) Пора решить эту проблему раз и на всегда!',
            blogId: firstBlog.id,
            blogName: firstBlog.name
        })
    })

    let secondPost: any = null;
    it('create one more post', async () => {
        const postInputModel: PostInputModel = {
            title: 'Уменьшаем размер NPM пакета',
            shortDescription: 'Однажды я захотел создать небольшую NPM библиотеку по всем “best practices”',
            content: 'И одной из интересных для меня меня задач при создании библиотеки была задача по максимальному уменьшению размера выходного NPM пакета - того, что в конечном итоге в теории будет использовать другой программист. И в этой статье я бы хотел описать, к каким методам я прибегал для того, чтобы достигнуть желанной цели.',
            blogId: firstBlog.id,
        }

        const createPostResponse = await request(app)
            .post('/posts')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(postInputModel)
            .expect(HTTP_STATUSES.CREATED_201)

        secondPost = createPostResponse.body
        expect(secondPost).toEqual({
            id: expect.any(String),
            title: 'Уменьшаем размер NPM пакета',
            shortDescription: 'Однажды я захотел создать небольшую NPM библиотеку по всем “best practices”',
            content: 'И одной из интересных для меня меня задач при создании библиотеки была задача по максимальному уменьшению размера выходного NPM пакета - того, что в конечном итоге в теории будет использовать другой программист. И в этой статье я бы хотел описать, к каким методам я прибегал для того, чтобы достигнуть желанной цели.',
            blogId: firstBlog.id,
            blogName: firstBlog.name
        })
    })

    it('should not update post with incorrect data', async () => {
        const updatePostInputModel = {
            title: '',
            shortDescription: '',
            content: '',
            blogId: '',
        };

        const notUpdatedPostResponse = await request(app)
            .put('/posts/' + secondPost.id)
            .auth('admin', 'qwerty', {type: "basic"})
            .send(updatePostInputModel)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(notUpdatedPostResponse.body).toEqual({
            errorsMessages: expect.any(Array)
        })
        expect(notUpdatedPostResponse.body.errorsMessages.length).toBe(4)
    })

    it('should not update post that is not exists', async () => {
        const updatePostInputModel = {
            title: 'some Title',
            shortDescription: 'some Description',
            content: 'some Content',
            blogId: '1'
        };
        await request(app)
            .put('/posts/1000')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(updatePostInputModel)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('can not update post without auth', async () => {
        const postInputModel: PostInputModel = {
            title: 'Мощь декораторов TypeScript',
            shortDescription: 'В рамках этой статьи разбирается несколько примеров из реальных проектов',
            content: 'С помощью декораторов мы можем избежать “дублирования” кода, инкапсулировав сквозную функциональность в отдельный модуль. Убрать лишний “шум” в коде, что позволит сфокусироваться автору на бизнес логике приложения.',
            blogId: firstBlog.id
        }

        await request(app)
            .put('/posts/' + firstPost.id)
            .send(postInputModel)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('should update post with correct input data', async () => {
        const postInputModel: PostInputModel = {
            title: 'Мощь декораторов TypeScript',
            shortDescription: 'В рамках этой статьи разбирается несколько примеров из реальных проектов',
            content: 'С помощью декораторов мы можем избежать “дублирования” кода, инкапсулировав сквозную функциональность в отдельный модуль. Убрать лишний “шум” в коде, что позволит сфокусироваться автору на бизнес логике приложения.',
            blogId: firstBlog.id
        }

        await request(app)
            .put('/posts/' + firstPost.id)
            .auth('admin', 'qwerty', {type: "basic"})
            .send(postInputModel)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/posts/' + firstPost.id)
            .expect(HTTP_STATUSES.OK_200, {
                ...firstPost,
                ...postInputModel
            })
    })

    it('can not delete post without auth',async () => {
        await request(app)
            .delete('/posts/' + firstPost.id)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('should delete both posts', async () => {
        await request(app)
            .delete('/posts/' + firstPost.id)
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/posts/' + firstPost.id)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .delete('/posts/' + secondPost.id)
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/posts/' + secondPost.id)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .get('/posts')
            .expect(HTTP_STATUSES.OK_200, [])
    })


});
