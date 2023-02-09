import {client, dbConnection} from "../../../db";
import request from "supertest";
import {app} from "../../../server";
import {HTTP_STATUSES} from "../../../common/presentationLayer/types/HttpStatuses";
import {LoginInputModel} from "../../auth/types/LoginInputModel";
import {usersService} from "../../user/users-service";

describe('DELETE -> "/security/devices"', () => {
    beforeAll(async () => {
        await dbConnection.dropDatabase();
    })

    afterAll(async () => {
        await client.close();
    })

    it('Should delete all device sessions for current user. Status 200', async () => {
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

        const token = firstResponseWithAccessToken.body.accessToken;

        await request(app)
            .post('/auth/login')
            .send(correctLoginAndPassword)
            .expect(HTTP_STATUSES.OK_200)

        await request(app)
            .delete('/security/devices')
            .auth(token, {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const allActiveSessions = await request(app)
            .get('/security/devices')
            .auth(token, {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.OK_200)

        expect(allActiveSessions.body.length).toBe(0)
    })

    it('Should return error if auth credentials are incorrect. Status 401', async () => {
        await request(app)
            .delete('/security/devices')
            .auth('', {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })
})
