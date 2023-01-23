import {query} from "express-validator";

export const validatePaginator = {
    pageNumber: query('pageNumber').default(1).isInt({min: 1}),
    pageSize: query('pageSize').default(10).isInt({min: 1})
}
