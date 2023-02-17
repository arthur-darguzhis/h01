import request from "supertest";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";
import {usersService} from "../../../src/modules/user/usersService";
import {UserInputModel} from "../../../src/modules/user/types/UserInputModel";
import {authService} from "../../../src/modules/auth/authService";
import {
    emailConfirmationRepository
} from "../../../src/modules/auth/emailConfirmation/repository/emailConfirmation.MongoDbRepository";
import {EmailConfirmation} from "../../../src/modules/auth/emailConfirmation/types/EmailConfirmation";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";
import {RateLimiter} from "../../../src/common/middlewares/rateLimiterMiddleware";

describe('POST => /auth/registration-email-resending', () => {

    beforeAll(async () => {
        await cleanDbBeforeTest();
    })

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('Should resend registration email to passed email address, Status 204', async () => {
        const validRegistrationData: UserInputModel = {
            login: 'infovoin',
            password: '12345678',
            email: "artur.dargujis@yandex.com"
        }

        const [_, emailConfirmation] = await authService.registerNewUser(validRegistrationData)
        await spoilConfirmationExpirationDate(emailConfirmation)

        //act
        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: validRegistrationData.email})
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('Should resend registration email if user exists but not confirmed yet. Status 204', async () => {
        const validRegistrationData: UserInputModel = {
            login: 'infovoin.by',
            password: '12345678',
            email: "artur.dargujis@yandex.by"
        }

        await authService.registerNewUser(validRegistrationData)

        //act
        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: validRegistrationData.email})
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    async function spoilConfirmationExpirationDate(emailConfirmation: EmailConfirmation): Promise<boolean> {
        return await emailConfirmationRepository.update(emailConfirmation._id, {"expirationDate": new Date().getTime()});
    }

    it('Should return error if email is already confirmed, Status 400', async () => {
        const mockRegistrationData: UserInputModel = {
            login: 'marlok',
            password: '12345678',
            email: "marlok@test.test"
        }

        const [mockUser, _] = await authService.registerNewUser(mockRegistrationData)
        await usersService.activateUser(mockUser._id);

        //act
        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: mockRegistrationData.email})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('Should return error if email doesnt exist; status 400', async () => {
        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: 'this_email_does_not_related_to_any_user@test.test'})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('return Error Too Many Requests, Status 429', async () => {
        for (let i = 0; i < 5; i++) {
            await request(app)
                .post('/auth/registration-email-resending')
                .send({email: ''})
        }

        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: ''})
            .expect(HTTP_STATUSES.TOO_MANY_REQUEST_429)

        RateLimiter.resetContainer()
    })

})
