import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../routes/types/HttpStatuses";
import {userRepository} from "../../../user/user.MongoDbRepository";
import {v4 as uuidv4} from "uuid";
import {client} from "../../../../db";
import {authService} from "../../auth.service";

describe('POST => /auth/registration-confirmation', () => {
    let realConfirmationCode: string;
    const fakeConfirmationCode = uuidv4()

    beforeAll(async () => {
        await userRepository.deleteAllUsers();
        const [user, emailConfirmation] = await authService.registerNewUser({
            login: 'infovoin',
            password: '12345678',
            email: "artur.dargujis@yandex.com"
        })
        realConfirmationCode = emailConfirmation.confirmationCode!
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
