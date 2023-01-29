import request from "supertest";
import {app} from "../../../../src";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {userRepository} from "../../../../src/repository/userMongoDbRepository";
import {usersService} from "../../../../src/domain/service/users-service";
import {UserType} from "../../../../src/domain/types/UserType";
import {UserInputModel} from "../../../../src/routes/inputModels/UserInputModel";
import {emailsManager} from "../../../../src/managers/emailsManager";

describe('POST => /auth/registration-email-resending', () => {
    const validRegistrationData: UserInputModel = {
        login: 'infovoin',
        password: '12345678',
        email: "artur.dargujis@yandex.com"
    }

    const ddosRegistrationData: UserInputModel = {
        login: 'ddos',
        password: '12345678',
        email: "artur.dargujis@yandex.ru"
    }

    const mockRegistrationData: UserInputModel = {
        login: 'marlok',
        password: '12345678',
        email: "marlok@test.test"
    }

    beforeAll(async () => {
        await userRepository.deleteAllUsers();

        const userId = await usersService.createUser(validRegistrationData, false)
        const user: UserType = await userRepository.getUser(userId)
        await emailsManager.sendConfirmationLetter(user)

        const expirationDate = user.emailConfirmation.expirationDate! - 60 * 20;
        await userRepository.updateUser(user._id, {"emailConfirmation.expirationDate": expirationDate});

        const mockUserId = await usersService.createUser(mockRegistrationData, false)
        await userRepository.updateUser(mockUserId, { isActive: true, "emailConfirmation.isConfirmed": true });

        await usersService.registerUser(ddosRegistrationData)
    })

    it('Input data is accepted. Email with confirmation code will be send to passed email address, status 204', async () => {
        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: validRegistrationData.email})
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('email is already confirmed, status 400', async () => {
        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: mockRegistrationData.email})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('it took less then 15 min from last trying to resend registration email, status 400', async () => {
        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: ddosRegistrationData.email})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

})
