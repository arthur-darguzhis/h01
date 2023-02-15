import {cleanDbBeforeTest, closeTestMongooseConnection} from "../../../src/common/testing/cleanDbBeforeTest";

describe('PUT -> /comments/:commentId', () => {
    beforeAll(async () => {
        await cleanDbBeforeTest()

        //TODO добавить регистрацию пользователя, добавить создание блога, создание поста, и создание комментария
    })

    afterAll(async () => {
        await closeTestMongooseConnection()
    })

    it.todo('Return status 401. When auth credentials are incorrect. ', async () => {
    })

    it.todo('Return status 404. When comment with specified id doesn\'t exists', async () => {
    })

    it.todo('Return status 400. When the inputModel has incorrect values', async () => {
    })

    it.todo('Return status 204. When the inputModel is correct and user make "like" operation', async () => {
    })

    it.todo('Return status 204. When the inputModel is correct and user make "dislike"', async () => {
    })

    it.todo('Return status 204. When the inputModel is correct and user make "reset" operation', async () => {
    })
})
