import {body} from "express-validator";

export const validateLogin = {
    body: {
        loginOrEmail: body('loginOrEmail').trim().notEmpty().escape(),
        password: body('password').trim().notEmpty().escape(),
    }
}
