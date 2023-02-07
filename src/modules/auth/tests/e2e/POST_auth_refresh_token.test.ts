import {usersService} from "../../../user/users-service";
import {LoginInputModel} from "../../types/LoginInputModel";
import request from "supertest";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";
import {app} from "../../../../server";
import {client, dbConnection} from "../../../../db";

describe('POST => /auth/refresh-token', () => {
    beforeAll(async () => {
        await dbConnection.dropDatabase();
        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@gmail.com"
        })
    })

    afterAll(async () => {
        await client.close();
    })

    it('Should logout user (remove cookies, and add refreshToken to black list), Status 200', async () => {
        const logInputModel: LoginInputModel = {
            "loginOrEmail": "user1",
            "password": "123456"
        }

        const responseWithToken = await request(app)
            .post('/auth/login')
            .send(logInputModel)
            .expect(HTTP_STATUSES.OK_200)

        const cookies = responseWithToken.header["set-cookie"];

        const refreshTokenResponse = await request(app)
            .post('/auth/refresh-token')
            .set("Cookie", [...cookies])
            .send()
            .expect(HTTP_STATUSES.OK_200)

        expect(refreshTokenResponse.body).toEqual({
            accessToken: expect.any(String)
        })

        expect(refreshTokenResponse.header['set-cookie'][0]).toMatch('refreshToken')
    })

    it('Should return error if the JWT refreshToken inside cookie is missing, expired or incorrect. Status 401', async () => {
        const logInputModel: LoginInputModel = {
            "loginOrEmail": "user1",
            "password": "123456"
        }

        await request(app)
            .post('/auth/login')
            .send(logInputModel)
            .expect(HTTP_STATUSES.OK_200)

        await request(app)
            .post('/auth/refresh-token')
            .send()
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })
});
