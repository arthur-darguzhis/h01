import request from "supertest";
import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";
import {UserInputModel} from "../../../src/modules/user/types/UserInputModel";
import {app} from "../../../src/server";
import {HTTP_STATUSES} from "../../../src/common/presentationLayer/types/HttpStatuses";

describe('POST -> "/users"', () => {
    beforeAll(async () => {
        await cleanDbBeforeTest()
    });

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it('Should return error if auth credentials are incorrect. Status 401', async () => {
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

    it('Should return error if passed body is incorrect. Status 400', async () => {
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

    it('Should create new user. Status 201', async () => {
        const inputUserModel: UserInputModel = {
            "login": "user1",
            "password": "123456",
            "email": "user1-test@test.test"
        }
        const newUser = await request(app)
            .post('/users')
            .auth('admin', 'qwerty', {type: "basic"})
            .send(inputUserModel)
            .expect(HTTP_STATUSES.CREATED_201)

        expect(newUser.body).toEqual({
            "id": expect.any(String),
            "login": "user1",
            "email": "user1-test@test.test",
            "createdAt": expect.any(String)
        })
    })
});
