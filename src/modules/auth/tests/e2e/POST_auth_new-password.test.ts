import {client, dbConnection} from "../../../../db";
import {usersService} from "../../../user/users-service";
import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";
import {NewPasswordRecoveryInputModel} from "../../types/NewPasswordRecoveryInputModel";
import {authService} from "../../auth.service";
import {PasswordRecoveryInputModel} from "../../types/PasswordRecoveryInputModel";
import {v4 as uuidv4} from "uuid";
import {passwordRecoveryRepository} from "../../../passwordRecovery/passwordRecoveryRepository";

describe('POST => /auth/new-password', () => {
    beforeAll(async () => {
        await dbConnection.dropDatabase();

        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@test.test",
        });
    })

    afterAll(async () => {
        await client.close();
    })

    it('Return status 204. If code is valid and new password is accepted', async () => {
        const passwordRecoveryInputModel: PasswordRecoveryInputModel = {email: "user1@test.test"}
        const passwordRecovery = await authService.passwordRecovery(passwordRecoveryInputModel)

        const inputData: NewPasswordRecoveryInputModel = {
            newPassword: '12345678',
            recoveryCode: passwordRecovery.code,
        }

        await request(app)
            .post('/auth/new-password')
            .send(inputData)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user1",
                "password": "12345678"
            })
            .expect(HTTP_STATUSES.OK_200)
    })

    it('Return status 400. If the inputModel has incorrect password format', async () => {

        const passwordRecoveryInputModel: PasswordRecoveryInputModel = {email: "user1@test.test"}
        const passwordRecovery = await authService.passwordRecovery(passwordRecoveryInputModel)

        const inputData: NewPasswordRecoveryInputModel = {
            newPassword: 'adsf',
            recoveryCode: passwordRecovery.code,
        }

        await request(app)
            .post('/auth/new-password')
            .send({email: "user1@test.test"})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('Return status 400. If the inputModel has incorrect recoveryCode', async () => {

        const inputData: NewPasswordRecoveryInputModel = {
            newPassword: 'adsf',
            recoveryCode: uuidv4(),
        }

        await request(app)
            .post('/auth/new-password')
            .send({email: "user1@test.test"})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('Return status 400. If the inputModel has expired recovery code', async () => {

        const passwordRecoveryInputModel: PasswordRecoveryInputModel = {email: "user1@test.test"}
        const passwordRecovery = await authService.passwordRecovery(passwordRecoveryInputModel)
        await passwordRecoveryRepository.update(passwordRecovery._id, {expirationDate: new Date().getTime() - 1000})

        const inputData: NewPasswordRecoveryInputModel = {
            newPassword: '12345678',
            recoveryCode: passwordRecovery.code,
        }

        await request(app)
            .post('/auth/new-password')
            .send({email: "user1@test.test"})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('Return status 429. If more than 5 attempts from one IP-address during 10 seconds', async () => {
        for (let i = 0; i < 5; i++) {
            await request(app)
                .post('/auth/new-password')
        }

        await request(app)
            .post('/auth/new-password')
            .expect(HTTP_STATUSES.TOO_MANY_REQUEST_429)
    })
})
