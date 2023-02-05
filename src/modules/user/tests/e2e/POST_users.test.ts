import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";
import {UserInputModel} from "../../types/UserInputModel";
import {client, dbConnection} from "../../../../db";

describe('POST -> "/users"', () => {
    beforeAll(async () => {
        await dbConnection.dropDatabase();
    });

    afterAll(async () => {
        await client.close();
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
