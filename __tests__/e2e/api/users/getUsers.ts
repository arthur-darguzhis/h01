import {userRepository} from "../../../../src/modules/user/user.MongoDbRepository";
import request from "supertest";
import {app} from "../../../../src/server";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {usersService} from "../../../../src/domain/service/users-service";
import {client} from "../../../../src/db";

describe('/users', () => {
    beforeAll(async () => {
        await userRepository.deleteAllUsers();

        for (let i = 1; i <= 12; i++) {
            await usersService.createUser({
                "login": "user" + i,
                "password": "123456" + i,
                "email": "user" + i + "-test@gmail.com"
            }, true)
        }
    });

    afterAll(async () => {
        await client.close();
    })

    it('only admin can read users list', async () => {
        await request(app)
            .get('/users')
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('get default pagination, 2 pages, 12 documents', async () => {
        const usersPaginatorResponse = await request(app)
            .get('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(HTTP_STATUSES.OK_200)

        expect(usersPaginatorResponse.body.items.length).toBe(10)
        expect(usersPaginatorResponse.body).toEqual({
            pagesCount: 2,
            page: 1,
            pageSize: 10,
            totalCount: 12,
            items: expect.any(Array),
        });

        expect(usersPaginatorResponse.body.items[0].login).toBe('user12')
        expect(usersPaginatorResponse.body.items[9].login).toBe('user3')
    })

    it('it return pagination with 4 documents, filtered by "searchLoginTerm = user1", "searchEmailTerm = user3" and sortedBy "login asc"', async () => {
        const usersPaginatorResponse = await request(app)
            .get('/users/?searchLoginTerm=user1&searchEmailTerm=user3&sortBy=login&sortDirection=asc')
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(HTTP_STATUSES.OK_200)

        expect(usersPaginatorResponse.body.items.length).toBe(5)
        expect(usersPaginatorResponse.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 5,
            items: expect.any(Array),
        });

        expect(usersPaginatorResponse.body.items[0].login).toBe('user1')
        expect(usersPaginatorResponse.body.items[4].login).toBe('user3')
    })
});
