import request from 'supertest'
import {app} from '../../src/'
import {HTTP_STATUSES} from '../../src/'
import {PostCourseDto} from "../../src/dto/PostCourseDto";
import {PutCourseDto} from "../../src/dto/PutCourseDto";


describe('/course', () => {
    beforeAll(async () => {
        await request(app).delete('/__test__data');
    });

    it('should return 200 and empty array', async () => {
        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK_200, [])
    })


    it('should return 404 for not existing course', async () => {
        await request(app)
            .get('/courses/1')
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should not create course with incorrect input data', async () => {
        const postCourseDto: PostCourseDto = {title: ''};
        await request(app)
            .post('/courses')
            .send(postCourseDto)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        //Второй запрос проверяет что курсы у нас действительно пустой массив, то есть мы не только статус кода проверили но еще и по факту.
        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK_200, [])
    })

    let createdCourse1: any = null;
    it('should create course with correct input data', async () => {
        const postCourseDto1: PostCourseDto = {title: 'new course'};
        const createResponse = await request(app)
            .post('/courses')
            .send(postCourseDto1)
            .expect(HTTP_STATUSES.CREATED_201)

        createdCourse1 = createResponse.body;

        expect(createdCourse1).toEqual(
            {
                id: expect.any(Number),
                title: postCourseDto1.title
            }
        )

        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK_200, [createdCourse1])

    });

    let createdCourse2: any = null;
    it('create one more course', async () => {
        const postCourseDto2: PostCourseDto = {title: 'new course 2'};
        const createResponse = await request(app)
            .post('/courses')
            .send(postCourseDto2)
            .expect(HTTP_STATUSES.CREATED_201)

        createdCourse2 = createResponse.body;

        expect(createdCourse2).toEqual(
            {
                id: expect.any(Number),
                title: postCourseDto2.title
            }
        )

        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK_200, [createdCourse1, createdCourse2])
    });

    it('should not update course with incorrect data', async () => {
        const putCourseDto: PutCourseDto = {title: ''};
        await request(app)
            .put('/courses/' + createdCourse1.id)
            .send(putCourseDto)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await request(app)
            .get('/courses/' + createdCourse1.id)
            .expect(HTTP_STATUSES.OK_200, createdCourse1)
    })

    it('should not update course that is not exists', async () => {
        const putCourseDto: PutCourseDto = {title: 'good title'};
        await request(app)
            .put('/courses/' + -100)
            .send(putCourseDto)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should update course with correct input data', async () => {
        const putCourseDto: PutCourseDto = {title: 'good new title'};
        await request(app)
            .put('/courses/' + createdCourse1.id)
            .send(putCourseDto)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/courses/' + createdCourse1.id)
            .expect(HTTP_STATUSES.OK_200, {
                ...createdCourse1,
                title: putCourseDto.title
            })

        await request(app)
            .get('/courses/' + createdCourse2.id)
            .expect(HTTP_STATUSES.OK_200, createdCourse2)
    })

    it('should delete both courses', async () => {
        await request(app)
            .delete('/courses/' + createdCourse1.id)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/courses/' + createdCourse1.id)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .delete('/courses/' + createdCourse2.id)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get('/courses/' + createdCourse2.id)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .get('/courses')
            .expect(HTTP_STATUSES.OK_200, [])
    })

});
