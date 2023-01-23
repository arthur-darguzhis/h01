import {PostViewModel} from "./PostViewModel";

export type PostPaginatorType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: PostViewModel[]
}
