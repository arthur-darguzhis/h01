import {body, query} from "express-validator";
import {sortDirections} from "../../routes/types/paginator/SortDirections";

export const validateBlog = {
    body: {
        name: body('name').trim().isLength({
            min: 1,
            max: 15
        }).withMessage('"name" length should be from 1 to 15'),

        description: body('description').trim().isLength({
            min: 1,
            max: 500
        }).withMessage('"description" length should be from 1 to 500'),

        websiteUrl: body('websiteUrl').trim().custom(websiteUrl => {
            const regex = /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/;
            const stringIsUrl = regex.test(websiteUrl);
            if (!stringIsUrl || websiteUrl.length <= 13 || websiteUrl.length >= 100) {
                throw new Error('"websiteUrl" should be valid URL and it\'s length should be from 13 to 100');
            }
            return true;
        }),
    },

    query: {
        searchNameTerm: query('searchNameTerm').trim(),

        sortBy: query('sortBy').default('createdAt').custom(sortBy => {
            const allowedFields = ['id', 'name', 'description', 'websiteUrl', 'createdAt'];
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
