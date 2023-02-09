import {client, dbConnection} from "../../../../db";
import {usersService} from "../../../user/users-service";
import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";

describe('POST => /auth/password-recovery', () => {
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

    it('Return status 400. If the inputModel has invalid email (for example 222^gmail.com)', async() => {
        await request(app)
            .post('/auth/password-recovery')
            .send({email: "222^gmail.com"})
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('Return status 204', async () => {
        await request(app)
            .post('/auth/password-recovery')
            .send({email: "user1@test.test"})
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('Even if current email is not registered (for prevent user\'s email detection). Status 204', async() => {
        await request(app)
            .post('/auth/password-recovery')
            .send({email: "emailThatIsNotRegisteredInTheSystem@test.test"})
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('Return status 429. If more than 5 attempts from one IP-address during 10 seconds', async() => {
        for (let i = 0; i < 5; i++) {
            await request(app)
                .post('/auth/password-recovery')
        }

        await request(app)
            .post('/auth/password-recovery')
            .expect(HTTP_STATUSES.TOO_MANY_REQUEST_429)
    })
})
