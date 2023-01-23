import {body, query} from "express-validator";
import {sortDirections} from "../../routes/types/SortDirections";

export const validateUser = {
    body: {
        login: body('login').matches(/^[a-zA-Z0-9_-]*$/).isLength({min: 3, max: 10}),
        password: body('password').isLength({min: 6, max: 20}),
        email: body('email').matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
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
