import {userRepository} from "../../../../src/modules/user/user.MongoDbRepository";
import {usersService} from "../../../../src/domain/service/users-service";
import {LoginInputModel} from "../../../../src/routes/inputModels/LoginInputModel";
import request from "supertest";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {app} from "../../../../src/server";
import {client} from "../../../../src/db";

describe('GET => /auth/me', () => {
    let token: string;
    beforeAll(async () => {
        await userRepository.deleteAllUsers();
        await usersService.createUser({
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
    })

    afterAll(async () => {
        await client.close();
    })

    it('return info about login user, status 200', async () => {
        const meResponse = await request(app)
            .get('/auth/me')
            .auth(token, {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.OK_200)

        expect(meResponse.body).toEqual({
            email: 'user1@gmail.com',
            login: 'user1',
            userId: expect.any(String),
        })
    })

    it('request without JWT token, status 401', async () => {
        await request(app)
            .get('/auth/me')
            .auth('', {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })
});
