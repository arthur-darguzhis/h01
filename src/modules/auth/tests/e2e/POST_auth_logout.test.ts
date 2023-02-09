import {usersService} from "../../../user/users-service";
import {LoginInputModel} from "../../types/LoginInputModel";
import request from "supertest";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";
import {app} from "../../../../server";
import {client, dbConnection} from "../../../../db";

describe('POST => /auth/logout', () => {
    beforeAll(async () => {
        await dbConnection.dropDatabase();
        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@test.test"
        })
    })

    afterAll(async () => {
        await client.close();
    })

    it('Should logout user (remove cookies, and add refreshToken to black list), Status 204', async () => {
        const logInputModel: LoginInputModel = {
            "loginOrEmail": "user1",
            "password": "123456"
        }

        const responseWithToken = await request(app)
            .post('/auth/login')
            .send(logInputModel)
            .expect(HTTP_STATUSES.OK_200)

        const cookies = responseWithToken.header["set-cookie"];

        await request(app)
            .post('/auth/logout')
            .set("Cookie", [...cookies])
            .send()
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('Should return error if the JWT refreshToken inside cookie is missing, expired or incorrect. Status 401', async () => {
        const logInputModel: LoginInputModel = {
            "loginOrEmail": "user1",
            "password": "123456"
        }

        const responseWithToken = await request(app)
            .post('/auth/login')
            .send(logInputModel)
            .expect(HTTP_STATUSES.OK_200)

        await request(app)
            .post('/auth/logout')
            .send()
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })
});
