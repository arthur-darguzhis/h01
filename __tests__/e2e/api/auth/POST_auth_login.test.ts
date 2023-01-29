import {userRepository} from "../../../../src/repository/userMongoDbRepository";
import {usersService} from "../../../../src/domain/service/users-service";
import request from "supertest";
import {app} from "../../../../src";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {LoginInputModel} from "../../../../src/routes/inputModels/LoginInputModel";

describe('POST => /auth/login', () => {
    beforeAll(async () => {
        await userRepository.deleteAllUsers();
        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@gmail.com",
        }, true)
    })

    it('return JWT token, status 201 code', async () => {
        const logInputModel: LoginInputModel = {
            "loginOrEmail": "user1",
            "password": "123456"
        }

        const token = await request(app)
            .post('/auth/login')
            .send(logInputModel)
            .expect(HTTP_STATUSES.OK_200)

        expect(token.body).toEqual({
            accessToken: expect.any(String)
        })
    })

    it('login and password are empty, status 400', async () => {
        const logInputModel = {}
        const validationResult = await request(app)
            .post('/auth/login')
            .send(logInputModel)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(validationResult.body).toEqual({
            errorsMessages: expect.any(Array)
        })

        expect(validationResult.body.errorsMessages.length).toBe(2)
    })

    it('login or password is wrong, status 401', async () => {
        const logInputModel: LoginInputModel = {
            "loginOrEmail": "user100",
            "password": "123456"
        }

        await request(app)
            .post('/auth/login')
            .send(logInputModel)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })
})
