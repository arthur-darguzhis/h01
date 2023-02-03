import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../routes/types/HttpStatuses";
import {userRepository} from "../../../user/user.MongoDbRepository";
import {usersService} from "../../../../domain/service/users-service";
import {UserType} from "../../../../domain/types/UserType";
import {UserInputModel} from "../../../../routes/inputModels/UserInputModel";
import {client} from "../../../../db";
import {authService} from "../../auth.service";
import {emailConfirmationRepository} from "../../../emailConfirmation/emailConfirmation.MongoDbRepository";
import {EmailConfirmationType} from "../../../emailConfirmation/types/EmailConfirmationType";

describe('POST => /auth/registration-email-resending', () => {

    beforeAll(async () => {
        await userRepository.deleteAllUsers();
    })

    afterAll(async () => {
        await client.close();
    })

    it('Input data is accepted. Email with confirmation code will be send to passed email address, status 204', async () => {
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

    it('should send email with new code if user exists but not confirmed yet; status 204', async () => {
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

    it('email is already confirmed, status 400', async () => {

        const mockRegistrationData: UserInputModel = {
            login: 'marlok',
            password: '12345678',
            email: "marlok@test.test"
        }

        const mockUser: UserType = await usersService.createUser(mockRegistrationData)
        await userRepository.updateUser(mockUser._id, { isActive: true, "emailConfirmation.isConfirmed": true });

        //act
        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: mockRegistrationData.email})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('should return error if user email doesnt exist; status 400', async () => {
        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: 'this_email_does_not_related_to_any_user@test.test'})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
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
