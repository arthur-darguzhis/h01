import {userRepository} from "../../../../src/repository/userMongoDbRepository";
import {usersService} from "../../../../src/domain/service/users-service";
import request from "supertest";
import {app} from "../../../../src/server";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {LoginInputModel} from "../../../../src/routes/inputModels/LoginInputModel";
import {client} from "../../../../src/db";

describe('POST => /auth/login', () => {
    beforeAll(async () => {
        await userRepository.deleteAllUsers();
        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@gmail.com",
        }, true)
    })

    afterAll(async () => {
        await client.close();
    })

    const correctLoginAndPassword: LoginInputModel = {
        "loginOrEmail": "user1",
        "password": "123456"
    }

    const incorrectLoginAndPassword: LoginInputModel = {
        "loginOrEmail": "user100",
        "password": "123456"
    }

    const emptyLoginAndPassword = {}

    it('return JWT token, status 201 code', async () => {
        const token = await request(app)
            .post('/auth/login')
            .send(correctLoginAndPassword)
            .expect(HTTP_STATUSES.OK_200)

        expect(token.body).toEqual({
            accessToken: expect.any(String)
        })
    })

    it('login and password are empty, status 400', async () => {
        const validationResult = await request(app)
            .post('/auth/login')
            .send(emptyLoginAndPassword)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(validationResult.body).toEqual({
            errorsMessages: expect.any(Array)
        })

        expect(validationResult.body.errorsMessages.length).toBe(2)
    })

    it('login or password is wrong, status 401', async () => {
        await request(app)
            .post('/auth/login')
            .send(incorrectLoginAndPassword)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })
})
