import {userRepository} from "../../../../src/modules/user/user.MongoDbRepository";
import request from "supertest";
import {app} from "../../../../src/server";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {UserInputModel} from "../../../../src/routes/inputModels/UserInputModel";
import {client} from "../../../../src/db";

describe('/users', () => {
    beforeAll(async () => {
        await userRepository.deleteAllUsers();
    });

    afterAll(async () => {
        await client.close();
    })

    it('check that only admin can add new user', async () => {
        const inputUserModel: UserInputModel = {
            "login": "us",
            "password": "12345",
            "email": "usergmailcom"
        }

        await request(app)
            .post('/users')
            .send(inputUserModel)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('validate input data for registration new user and return 400 with 3 errors', async () => {
        const inputUserModel: UserInputModel = {
            "login": "us",
            "password": "12345",
            "email": "usergmailcom"
        }
        const validationResult = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(inputUserModel)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        expect(validationResult.body).toEqual({
            errorsMessages: expect.any(Array)
        })

        expect(validationResult.body.errorsMessages.length).toBe(3)
    })

    it('successfully add new user with valid input data and return ', async () => {
        const inputUserModel: UserInputModel = {
            "login": "user1",
            "password": "123456",
            "email": "user1-test@gmail.com"
        }
        const newUser = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(inputUserModel)
            .expect(HTTP_STATUSES.CREATED_201)

        expect(newUser.body).toEqual({
            "id": expect.any(String),
            "login": "user1",
            "email": "user1-test@gmail.com",
            "createdAt": expect.any(String)
        })
    })
});
