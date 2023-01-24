import {userRepository} from "../../../../src/repository/userMongoDbRepository";
import {usersService} from "../../../../src/domain/service/users-service";
import request from "supertest";
import {app} from "../../../../src";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {LoginInputModel} from "../../../../src/routes/inputModels/LoginInputModel";

describe('/auth', () => {
    beforeAll(async () => {
        await userRepository.deleteAllUsers();
        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@gmail.com"
        })
    })

    it('validate input data for login and return 400 with 2 errors', async () => {
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

    it('get 401 code, because can not login with wrong credentials', async () => {
        const logInputModel: LoginInputModel = {
            "loginOrEmail": "user100",
            "password": "123456"
        }

        await request(app)
            .post('/auth/login')
            .send(logInputModel)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('successfully login and return 201 code', async () => {
        const logInputModel: LoginInputModel = {
            "loginOrEmail": "user1",
            "password": "123456"
        }

        await request(app)
            .post('/auth/login')
            .send(logInputModel)
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })
})
