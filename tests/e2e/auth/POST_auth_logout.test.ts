import {container} from "../../../src/common/compositon-root";
import {UsersService} from "../../../src/modules/user/usersService";
import {LoginInputModel} from "../../../src/modules/auth/types/LoginInputModel";
import request from "supertest";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {app} from "../../../src/server";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";

const usersService = container.resolve(UsersService);

describe('POST => /auth/logout', () => {
    beforeAll(async () => {
        await cleanDbBeforeTest()
        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@test.test"
        })
    })

    afterAll(async () => {
        await closeTestMongooseConnection()
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

        await request(app)
            .post('/auth/login')
            .send(logInputModel)
            .expect(HTTP_STATUSES.OK_200)

        await request(app)
            .post('/auth/logout')
            .send()
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })
});
