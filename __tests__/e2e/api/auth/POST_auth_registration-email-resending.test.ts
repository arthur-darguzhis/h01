import request from "supertest";
import {app} from "../../../../src/server";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {userRepository} from "../../../../src/modules/user/user.MongoDbRepository";
import {usersService} from "../../../../src/domain/service/users-service";
import {UserType} from "../../../../src/domain/types/UserType";
import {UserInputModel} from "../../../../src/routes/inputModels/UserInputModel";
import {emailsManager} from "../../../../src/managers/emailsManager";
import {client} from "../../../../src/db";

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

        const user: UserType = await usersService.createUser(validRegistrationData, false)
        await emailsManager.sendConfirmationLetter(user)
        await spoilExpirationDateForUser(user)


        //act
        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: validRegistrationData.email})
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    async function spoilExpirationDateForUser(user: UserType): Promise<boolean> {
        return await userRepository.updateUser(user._id, {"emailConfirmation.expirationDate": new Date().getTime()});
    }

    it('email is already confirmed, status 400', async () => {

        const mockRegistrationData: UserInputModel = {
            login: 'marlok',
            password: '12345678',
            email: "marlok@test.test"
        }

        const mockUser: UserType = await usersService.createUser(mockRegistrationData, false)
        await userRepository.updateUser(mockUser._id, { isActive: true, "emailConfirmation.isConfirmed": true });

        //act
        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: mockRegistrationData.email})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('it took less then 15 min from last trying to resend registration email, status 400', async () => {
        const ddosRegistrationData: UserInputModel = {
            login: 'ddos',
            password: '12345678',
            email: "artur.dargujis@yandex.ru"
        }

        await usersService.registerUser(ddosRegistrationData)

        //act
        await request(app)
            .post('/auth/registration-email-resending')
            .send({email: ddosRegistrationData.email})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

})
