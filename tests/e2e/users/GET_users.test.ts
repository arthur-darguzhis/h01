import {container} from "../../../src/common/compositon-root";
import request from "supertest";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";
import {UsersService} from "../../../src/modules/user/usersService";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";

const usersService = container.resolve(UsersService);

describe('GET -> "/users"', () => {
    beforeAll(async () => {
        await cleanDbBeforeTest()

        for (let i = 1; i <= 12; i++) {
            await usersService.createUser({
                "login": "user" + i,
                "password": "123456" + i,
                "email": "user" + i + "-test@test.test"
            })
        }
    });

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('Should return error if auth credentials are incorrect. Status 401', async () => {
        await request(app)
            .get('/users')
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('Should return users pagination 2 pages, 12 documents. Status 200', async () => {
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

    it('Should return users pagination filtered by "searchLoginTerm = user1", "searchEmailTerm = user3" and sortedBy "login asc" 1 pages, 5 documents. Status 200', async () => {
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
