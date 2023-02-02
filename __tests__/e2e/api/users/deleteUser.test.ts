import {userRepository} from "../../../../src/modules/user/user.MongoDbRepository";
import request from "supertest";
import {app} from "../../../../src/server";
import {HTTP_STATUSES} from "../../../../src/routes/types/HttpStatuses";
import {UserInputModel} from "../../../../src/routes/inputModels/UserInputModel";
import {client} from "../../../../src/db";

let userIdForDelete: string;
describe('/users', () => {
    beforeAll(async () => {
        await userRepository.deleteAllUsers();

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

        userIdForDelete = newUser.body.id
    });

    afterAll(async () => {
        await client.close();
    })

    it('check that only admin can delete a user', async () => {
        await request(app)
            .delete('/users/'+userIdForDelete)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('cant remove user that is not exists', async () => {
        await request(app)
            .delete('/users/63cff7135a31073c1f07e2e3')
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('delete user', async () => {
        await request(app)
            .delete('/users/'+userIdForDelete)
            .auth('admin', 'qwerty', {type: "basic"})
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })
});
