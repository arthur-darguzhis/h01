import {BlogViewModel} from "./BlogViewModel";

export type BlogPaginatorType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: BlogViewModel[]
}
