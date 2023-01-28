import {body, query} from "express-validator";
import {sortDirections} from "../../routes/types/SortDirections";
import {userQueryRepository} from "../../queryRepository/userQueryRepository";

export const validateUser = {
    body: {
        password: body('password').trim().isLength({min: 6, max: 20}),

        login: body('login').trim().matches(/^[a-zA-Z0-9_-]*$/).isLength({min: 3, max: 10}).custom(async login => {
            const user = await userQueryRepository.findByLogin(login);
            if(user) throw Error(`User with login: ${login} is already exists`);
        }),

        email: body('email').trim().matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).custom(async email => {
            const user = await userQueryRepository.findByEmail(email);
            if(user) throw new Error(`User with email: ${email} is already exists`);
            return true;
        }),
    },
    query: {
        searchLoginTerm: query('searchLoginTerm').default(null).trim(),
        searchEmailTerm: query('searchEmailTerm').default(null).trim(),
        sortBy: query('sortBy').default('createdAt').custom(sortBy => {
            const allowedFields = ['id', 'login', 'email', 'createdAt'];
            if (!allowedFields.includes(sortBy)) {
                throw new Error(`'sortBy' value can be one of: ${allowedFields.toString()}`);
            }
            return true;
        }),
        sortDirection: query('sortDirection').default('desc').custom(sortDirection => {
            if (!sortDirections.includes(sortDirection)) {
                throw new Error(`'sortDirection' value can be of ${sortDirections.toString()}`);
            }
            return true;
        }),
    }
}
