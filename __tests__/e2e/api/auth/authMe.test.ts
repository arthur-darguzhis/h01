import {userRepository} from "../../../../src/repository/userMongoDbRepository";
import {usersService} from "../../../../src/domain/service/users-service";
import {LoginInputModel} from "../../../../src/routes/inputModels/LoginInputModel";
import request from "supertest";
import {app} from "../../../../src";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";

let token: string;
describe('/auth/me', () => {
    beforeAll(async () => {
        await userRepository.deleteAllUsers();
        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@gmail.com"
        })

        const logInputModel: LoginInputModel = {
            "loginOrEmail": "user1",
            "password": "123456"
        }

        const responseWithToken = await request(app)
            .post('/auth/login')
            .send(logInputModel)
            .expect(HTTP_STATUSES.OK_200)
        token = responseWithToken.body.accessToken;
    })

    it('can not get info if token is not valid', async () => {
        await request(app)
            .get('/auth/me')
            .auth('', {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('return info about user if token is valid', async () => {
        const meResponse = await request(app)
            .get('/auth/me')
            .auth(token, {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.OK_200)

        expect(meResponse.body).toEqual({
            email:	'user1@gmail.com',
            login:	'user1',
            userId:	expect.any(String),
        })
    })
});
