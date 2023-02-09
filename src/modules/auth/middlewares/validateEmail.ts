import {body} from "express-validator";

export const validateEmail = body('email').trim().matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
