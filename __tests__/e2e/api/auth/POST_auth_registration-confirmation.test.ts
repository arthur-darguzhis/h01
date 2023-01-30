import request from "supertest";
import {app} from "../../../../src/server";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {userRepository} from "../../../../src/repository/userMongoDbRepository";
import {usersService} from "../../../../src/domain/service/users-service";
import {UserType} from "../../../../src/domain/types/UserType";
import {v4 as uuidv4} from "uuid";
import {client} from "../../../../src/db";

describe('POST => /auth/registration-confirmation', () => {
    let realConfirmationCode: string;
    const fakeConfirmationCode = uuidv4()

    beforeAll(async () => {
        await userRepository.deleteAllUsers();
        const user: UserType = await usersService.createUser({
            login: 'infovoin',
            password: '12345678',
            email: "artur.dargujis@yandex.com"
        }, false)
        realConfirmationCode = user.emailConfirmation.confirmationCode!
    })

    afterAll(async () => {
        await client.close();
    })

    it('Verify email, activate account, status 204', async () => {
        await request(app)
            .post('/auth/registration-confirmation')
            .send({code: realConfirmationCode})
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('Confirmation code is incorrect, status 400', async () => {
        await request(app)
            .post('/auth/registration-confirmation')
            .send(fakeConfirmationCode)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

})
