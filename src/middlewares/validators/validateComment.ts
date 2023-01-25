import {body, query} from "express-validator";
import {sortDirections} from "../../routes/types/SortDirections";

export const validateComment = {
    body: {
        content: body('content').trim().isLength({min: 20, max: 300})
    },

    query: {
        sortBy: query('sortBy').default('createdAt').custom(sortBy => {
            const allowedFields = ['id', 'content', 'commentatorInfo.userId', 'commentatorInfo.userLogin', 'createdAt']
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
        })
    }
}
