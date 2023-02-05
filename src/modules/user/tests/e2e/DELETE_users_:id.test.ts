import request from "supertest";
import {app} from "../../../../server";
import {HTTP_STATUSES} from "../../../../common/presentationLayer/types/HttpStatuses";
import {UserInputModel} from "../../types/UserInputModel";
import {client, dbConnection} from "../../../../db";

describe('DELETE -> "/users/:id"', () => {
    beforeAll(async () => {
        await dbConnection.dropDatabase();
    });

    afterAll(async () => {
        await client.close();
    })

    it('Should return error if auth credentials are incorrect. Status 401', async () => {
        await request(app)
            .delete('/users/63cff7135a31073c1f07e2e3')
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('Should return error if "user" with :id from uri param is not found. Status 404', async () => {
        await request(app)
            .delete('/users/63cff7135a31073c1f07e2e3')
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('Should delete user by id. Status 204', async () => {
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

        await request(app)
            .delete('/users/' + newUser.body.id)
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/users/' + newUser.body.id)
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })
});
