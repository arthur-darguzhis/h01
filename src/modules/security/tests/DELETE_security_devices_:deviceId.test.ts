import {client, dbConnection} from "../../../db";
import request from "supertest";
import {app} from "../../../server";
import {HTTP_STATUSES} from "../../../common/presentationLayer/types/HttpStatuses";
import {LoginInputModel} from "../../auth/types/LoginInputModel";
import {usersService} from "../../user/users-service";

describe('DELETE -> "/security/devices"', () => {
    let user1token: string;
    let user2token: string;
    beforeAll(async () => {
        await dbConnection.dropDatabase();

        await usersService.createUser({
            "login": "user1",
            "password": "123456",
            "email": "user1@test.test",
        })

        const correctLoginAndPassword: LoginInputModel = {
            "loginOrEmail": "user1",
            "password": "123456"
        }

        const user1ResponseWithAccessToken = await request(app)
            .post('/auth/login')
            .send(correctLoginAndPassword)
            .expect(HTTP_STATUSES.OK_200)

        user1token = user1ResponseWithAccessToken.body.accessToken;

        await request(app)
            .post('/auth/login')
            .send(correctLoginAndPassword)
            .expect(HTTP_STATUSES.OK_200)

        await usersService.createUser({
            "login": "user2",
            "password": "123456",
            "email": "user2@test.test",
        })

        const user2ResponseWithAccessToken = await request(app)
            .post('/auth/login')
            .send({
                "loginOrEmail": "user2",
                "password": "123456",
            })
            .expect(HTTP_STATUSES.OK_200)
        user2token = user2ResponseWithAccessToken.body.accessToken;
    })

    afterAll(async () => {
        await client.close();
    })

    it('Should return error if auth credentials are incorrect. Status 401', async () => {
        const faceDeviceId = '38906573-eea4-4116-b317-0a927289c3bb';
        await request(app)
            .delete('/security/devices/' + faceDeviceId)
            .auth('', {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('Should return error if "userSession" with :deviceId from uri param is not found. Status 404', async () => {
        const faceDeviceId = '38906573-eea4-4116-b317-0a927289c3bb';
        await request(app)
            .delete('/security/devices/' + faceDeviceId)
            .auth(user1token, {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('Should return error if user try to delete a "userSession" that is not it`s own. Status 403', async () => {
        const allUser2Sessions = await request(app)
            .get('/security/devices')
            .auth(user2token, {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.OK_200)

        const user2deviceId = allUser2Sessions.body[0].deviceId

        await request(app)
            .delete('/security/devices/' + user2deviceId)
            .auth(user1token, {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.FORBIDDEN_403)
    })

    it('Should delete all device sessions for current user. Status 200', async () => {


        const activeSessionsResponseBefore = await request(app)
            .get('/security/devices')
            .auth(user1token, {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.OK_200)

        expect(activeSessionsResponseBefore.body.length).toBe(2)

        const deviceIdToRemove = activeSessionsResponseBefore.body[0].deviceId
        await request(app)
            .delete('/security/devices/' + deviceIdToRemove)
            .auth(user1token, {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const activeSessionsResponseAfter = await request(app)
            .get('/security/devices')
            .auth(user1token, {type: "bearer"})
            .send()
            .expect(HTTP_STATUSES.OK_200)

        expect(activeSessionsResponseAfter.body.length).toBe(1)
    })
})
