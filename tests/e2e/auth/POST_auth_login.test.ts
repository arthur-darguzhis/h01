import {usersService} from "../../../src/modules/user/users-service";
import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {LoginInputModel} from "../../../src/modules/auth/types/LoginInputModel";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";

describe('POST => /auth/login', () => {
    beforeAll(async () => {
        await cleanDbBeforeTest()
        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@test.test",
        })
    })

    afterAll(async () => {
        await closeTestMongooseConnection()
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

    it('return JWT token, Status 201', async () => {
        const token = await request(app)
            .post('/auth/login')
            .send(correctLoginAndPassword)
            .expect(HTTP_STATUSES.OK_200)

        expect(token.body).toEqual({
            accessToken: expect.any(String)
        })
    })

    it('login and password are empty, Status 400', async () => {
        const validationResult = await request(app)
            .post('/auth/login')
            .send(emptyLoginAndPassword)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(validationResult.body).toEqual({
            errorsMessages: expect.any(Array)
        })

        expect(validationResult.body.errorsMessages.length).toBe(2)
    })

    it('login or password is wrong, Status 401', async () => {
        await request(app)
            .post('/auth/login')
            .send(incorrectLoginAndPassword)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    // it('return Error Too Many Requests, Status 429', async () => {
    //     for (let i = 0; i < 5; i++) {
    //         await request(app)
    //             .post('/auth/login')
    //             .send(correctLoginAndPassword)
    //     }
    //
    //     await request(app)
    //         .post('/auth/login')
    //         .send(correctLoginAndPassword)
    //         .expect(HTTP_STATUSES.TOO_MANY_REQUEST_429)
    // })

})
