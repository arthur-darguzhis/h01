import {UserInputModel} from "../../../src/modules/user/types/UserInputModel";
import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";

describe('POST => /auth/registration', () => {
    beforeAll(async () => {
        await cleanDbBeforeTest()
    })

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    const validRegistrationData: UserInputModel = {
        login: 'infovoin',
        password: '12345678',
        email: "artur.dargujis@yandex.com"
    }

    const invalidRegistrationData: UserInputModel = {
        login: '!%&$(@_!',
        password: '01',
        email: "test.test"
    }

    it('Input data is accepted. Email with confirmation code will be send to passed email address. Status 204', async () => {
        await request(app)
            .post('/auth/registration')
            .send(validRegistrationData)
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('"login", "password" and "email" are invalid, Status 400', async () => {
        const registrationResponse = await request(app)
            .post('/auth/registration')
            .send(invalidRegistrationData)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(registrationResponse.body).toEqual({
            errorsMessages: expect.any(Array)
        })
        expect(registrationResponse.body.errorsMessages.length).toBe(3)
    })

    it('User with the given email or login already exists, Status 400', async () => {
        await request(app)
            .post('/auth/registration')
            .send(validRegistrationData)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    // it('return Error Too Many Requests, Status 429', async () => {
    //     for (let i = 0; i < 5; i++) {
    //         await request(app)
    //             .post('/auth/registration')
    //             .send(validRegistrationData)
    //     }
    //
    //     await request(app)
    //         .post('/auth/registration')
    //         .send(validRegistrationData)
    //         .expect(HTTP_STATUSES.TOO_MANY_REQUEST_429)
    // })
})
