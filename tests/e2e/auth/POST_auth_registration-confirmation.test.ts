import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {v4 as uuidv4} from "uuid";
import {AuthService} from "../../../src/modules/auth/authService";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";
import {RateLimiter} from "../../../src/common/middlewares/rateLimiterMiddleware";
import {container} from "../../../src/common/compositon-root";

const authService = container.resolve(AuthService)

describe('POST => /auth/registration-confirmation', () => {
    let realConfirmationCode: string;
    const fakeConfirmationCode = uuidv4()

    beforeAll(async () => {
        await cleanDbBeforeTest()
        const [_, emailConfirmation] = await authService.registerNewUser({
            login: 'infovoin',
            password: '12345678',
            email: "artur.dargujis@yandex.com"
        })
        realConfirmationCode = emailConfirmation.confirmationCode!
    })

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('It should verify email and activate account when confirmationCode is valid, Status 204', async () => {
        await request(app)
            .post('/auth/registration-confirmation')
            .send({code: realConfirmationCode})
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('It should return error if confirmation code is incorrect, Status 400', async () => {
        await request(app)
            .post('/auth/registration-confirmation')
            .send(fakeConfirmationCode)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('return Error Too Many Requests, Status 429', async () => {
        for (let i = 0; i < 5; i++) {
            await request(app)
                .post('/auth/registration-confirmation')
                .send({code: realConfirmationCode})
        }

        await request(app)
            .post('/auth/registration-confirmation')
            .send({code: realConfirmationCode})
            .expect(HTTP_STATUSES.TOO_MANY_REQUEST_429)

        RateLimiter.resetContainer()
    })
})
