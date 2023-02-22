import {container} from "../../../src/common/compositon-root";
import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {LoginInputModel} from "../../../src/modules/auth/types/LoginInputModel";
import {UsersService} from "../../../src/modules/user/usersService";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";

const usersService = container.resolve(UsersService);

describe('GET -> "/security/devices"', () => {
    beforeAll(async () => {
        await cleanDbBeforeTest()
    })

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('Status 200', async () => {
        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@test.test",
        })

        const correctLoginAndPassword: LoginInputModel = {
            "loginOrEmail": "user1",
            "password": "123456"
        }

        const firstResponseWithAccessToken = await request(app)
            .post('/auth/login')
            .send(correctLoginAndPassword)
            .expect(HTTP_STATUSES.OK_200)

        const cookies = firstResponseWithAccessToken.header["set-cookie"];


        await request(app)
            .post('/auth/login')
            .send(correctLoginAndPassword)
            .expect(HTTP_STATUSES.OK_200)

        const allActiveSessions = await request(app)
            .get('/security/devices')
            .set("Cookie", [...cookies])
            .expect(HTTP_STATUSES.OK_200)

        expect(allActiveSessions.body.length).toBe(2)
        expect(allActiveSessions.body[0]).toEqual({
            "ip": expect.any(String),
            "title": expect.any(String),
            "lastActiveDate": expect.any(String),
            "deviceId": expect.any(String)
        });
    })

    it('Status 401', async () => {
        await request(app)
            .get('/security/devices')
            .send()
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })
})
