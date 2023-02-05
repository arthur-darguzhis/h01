import {usersService} from "../../../user/users-service";
import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";
import {LoginInputModel} from "../../types/LoginInputModel";
import {client, dbConnection} from "../../../../db";

describe('POST => /auth/login', () => {
    beforeAll(async () => {
        await dbConnection.dropDatabase();
        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@gmail.com",
        })
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
})
