import {body, query} from "express-validator";

export const validateUser = {
    body: {
        login: body('login').matches(/^[a-zA-Z0-9_-]*$/).isLength({min: 3, max: 10}),
        password: body('password').isLength({min: 6, max: 20}),
        email: body('email').matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    },
    query: {}
}
