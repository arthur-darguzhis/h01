import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";
import {usersService} from "../../../user/users-service";
import {UserType} from "../../../user/types/UserType";
import {UserInputModel} from "../../../user/types/UserInputModel";
import {client, dbConnection} from "../../../../db";
import {authService} from "../../auth.service";
import {emailConfirmationRepository} from "../../../emailConfirmation/emailConfirmation.MongoDbRepository";
import {EmailConfirmationType} from "../../../emailConfirmation/types/EmailConfirmationType";

describe('POST => /auth/registration-email-resending', () => {

    beforeAll(async () => {
        await dbConnection.dropDatabase();
    })

    afterAll(async () => {
        await client.close();
    })

    it('Should resend registration email to passed email address, Status 204', async () => {
        const validRegistrationData: UserInputModel = {
            login: 'infovoin',
            password: '12345678',
            email: "artur.dargujis@yandex.com"
        }

        const [user, emailConfirmation] = await authService.registerNewUser(validRegistrationData)
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

        const [user, emailConfirmation] = await authService.registerNewUser(validRegistrationData)

        //act
        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: validRegistrationData.email})
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    async function spoilConfirmationExpirationDate(emailConfirmation: EmailConfirmationType): Promise<boolean> {
        return await emailConfirmationRepository.update(emailConfirmation._id, {"expirationDate": new Date().getTime()});
    }

    it('Shoult return error if email is already confirmed, Status 400', async () => {

        const mockRegistrationData: UserInputModel = {
            login: 'marlok',
            password: '12345678',
            email: "marlok@test.test"
        }

        const mockUser: UserType = await usersService.createUser(mockRegistrationData)
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
    })
    // it('it took less then 15 min from last trying to resend registration email, status 400', async () => {
    //     const ddosRegistrationData: UserInputModel = {
    //         login: 'ddos',
    //         password: '12345678',
    //         email: "artur.dargujis@yandex.ru"
    //     }
    //
    //     await authService.registerNewUser(ddosRegistrationData)
    //
    //     //act
    //     await request(app)
    //         .post('/auth/registration-email-resending')
    //         .send({email: ddosRegistrationData.email})
    //         .expect(HTTP_STATUSES.BAD_REQUEST_400)
    // })

})
