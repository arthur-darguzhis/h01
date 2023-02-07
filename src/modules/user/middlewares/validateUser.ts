import {body, query} from "express-validator";
import {sortDirections} from "../../auth/types/paginator/SortDirections";
import {userQueryRepository} from "../user.QueryRepository";
import {EntityAlreadyExists} from "../../../common/exceptions/EntityAlreadyExists";
import {InvalidValue} from "../../../common/exceptions/InvalidValue";

export const validateUser = {
    body: {
        password: body('password').trim().isLength({min: 6, max: 20}),

        login: body('login').trim().matches(/^[a-zA-Z0-9_-]*$/).isLength({min: 3, max: 10}).custom(async login => {
            const user = await userQueryRepository.findByLogin(login);
            if(user) throw Error(`User with login: ${login} is already exists`);
        }),

        email: body('email').trim().matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).custom(async email => {
            const user = await userQueryRepository.findByEmail(email);
            if(user && user.isActive) throw new EntityAlreadyExists(`User with email: ${email} is already exists`);
            return true;
        }),
    },
    query: {
        searchLoginTerm: query('searchLoginTerm').trim(),
        searchEmailTerm: query('searchEmailTerm').trim(),
        sortBy: query('sortBy').default('createdAt').custom(sortBy => {
            const allowedFields = ['id', 'login', 'email', 'createdAt'];
            if (!allowedFields.includes(sortBy)) {
                throw new InvalidValue(`'sortBy' value can be one of: ${allowedFields.toString()}`);
            }
            return true;
        }),
        sortDirection: query('sortDirection').default('desc').custom(sortDirection => {
            if (!sortDirections.includes(sortDirection)) {
                throw new InvalidValue(`'sortDirection' value can be of ${sortDirections.toString()}`);
            }
            return true;
        }),
    }
}