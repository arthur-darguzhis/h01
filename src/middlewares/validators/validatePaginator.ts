import {query} from "express-validator";

export const validatePaginator = {
    pageNumber: query('pageNumber').optional({nullable: true}).trim().notEmpty().isInt({min: 1}),
    pageSize: query('pageSize').optional({nullable: true}).trim().notEmpty().isInt({min: 1})
}
