import request from "supertest";
import {usersService} from "../../../src/modules/user/usersService";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";
import {LoginInputModel} from "../../../src/modules/auth/types/LoginInputModel";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";

describe('DELETE -> "/security/devices"', () => {
    beforeAll(async () => {
        await cleanDbBeforeTest()
    })

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('Should terminate all other (exclude current) device\'s sessions Status 200', async () => {
        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@test.test",
        })

        const correctLoginAndPassword: LoginInputModel = {
            "loginOrEmail": "user1",
            "password": "123456"
        }

        const firstResponseWithAccessToken = await request(app)
            .post('/auth/login')
            .send(correctLoginAndPassword)
            .expect(HTTP_STATUSES.OK_200)

        const cookies = firstResponseWithAccessToken.header["set-cookie"];

        await request(app)
            .post('/auth/login')
            .send(correctLoginAndPassword)
            .expect(HTTP_STATUSES.OK_200)

        await request(app)
            .delete('/security/devices')
            .set("Cookie", [...cookies])
            .send()
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const allActiveSessions = await request(app)
            .get('/security/devices')
            .set("Cookie", [...cookies])
            .send()
            .expect(HTTP_STATUSES.OK_200)

        expect(allActiveSessions.body.length).toBe(1)
    })

    it('Should return error if auth credentials are incorrect. Status 401', async () => {
        await request(app)
            .delete('/security/devices')
            .auth('', {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })
})
