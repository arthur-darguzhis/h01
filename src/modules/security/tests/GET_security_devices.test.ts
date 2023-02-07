import {client, dbConnection} from "../../../db";
import request from "supertest";
import {app} from "../../../server";
import {HTTP_STATUSES} from "../../../common/presentationLayer/types/HttpStatuses";
import {LoginInputModel} from "../../auth/types/LoginInputModel";
import {usersService} from "../../user/users-service";

describe('GET -> "/security/devices"', () => {
    beforeAll(async () => {
        await dbConnection.dropDatabase();
    })

    afterAll(async () => {
        await client.close();
    })

    it('Status 200', async () => {
        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@gmail.com",
        })

        const correctLoginAndPassword: LoginInputModel = {
            "loginOrEmail": "user1",
            "password": "123456"
        }

        const firstResponseWithAccessToken = await request(app)
            .post('/auth/login')
            .send(correctLoginAndPassword)
            .expect(HTTP_STATUSES.OK_200)

        const token = firstResponseWithAccessToken.body.accessToken;

        await request(app)
            .post('/auth/login')
            .send(correctLoginAndPassword)
            .expect(HTTP_STATUSES.OK_200)

        const allActiveSessions = await request(app)
            .get('/security/devices')
            .auth(token, {type: "bearer"})
            .send()
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
            .auth('', {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })
})
