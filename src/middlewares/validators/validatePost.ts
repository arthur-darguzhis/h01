import {body, query} from "express-validator";
import {blogQueryRepository} from "../../queryRepository/blogQueryRepository";
import {sortDirections} from "../../routes/types/SortDirections";

export const validatePost = {
    body: {
        title: body('title').trim().isLength({
            min: 1,
            max: 30
        }).withMessage('"title" length should be from 1 to 30'),

        shortDescription: body('shortDescription').trim().isLength({
            min: 1,
            max: 100
        }).withMessage('"shortDescription" length should be from 1 to 100'),

        content: body('content').trim().isLength({
            min: 1,
            max: 1000
        }).withMessage('"content" length should be from 1 to 1000'),

        blogId: body('blogId').custom(async (blogId) => {
            const blog = await blogQueryRepository.findBlog(blogId);
            if (!blog) {
                throw new Error(`Blog with ID: ${blogId} is not exists`);
            }
            return true;
        })
    },
    query: {
        sortBy: query('sortBy').default('createdAt').custom(sortBy => {
            const allowedFields = ['id', 'string', 'title', 'shortDescription', 'content', 'blogId', 'blogName', 'createdAt']
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
