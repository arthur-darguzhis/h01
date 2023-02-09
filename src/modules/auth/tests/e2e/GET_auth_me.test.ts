import {usersService} from "../../../user/users-service";
import {LoginInputModel} from "../../types/LoginInputModel";
import request from "supertest";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";
import {app} from "../../../../server";
import {client, dbConnection} from "../../../../db";

describe('GET => /auth/me', () => {
    let token: string;
    beforeAll(async () => {
        await dbConnection.dropDatabase();
        await usersService.createUser({
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
    })

    afterAll(async () => {
        await client.close();
    })

    it('Should return info about logged-in user, Status 200', async () => {
        const meResponse = await request(app)
            .get('/auth/me')
            .auth(token, {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.OK_200)

        expect(meResponse.body).toEqual({
            email: 'user1@test.test',
            login: 'user1',
            userId: expect.any(String),
        })
    })

    it('Should return error if auth token is incorrect. Status 401', async () => {
        await request(app)
            .get('/auth/me')
            .auth('', {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })
});
