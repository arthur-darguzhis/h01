import {CommentViewModel} from "./CommentViewModel";

export type CommentPaginatorType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: CommentViewModel[]
}
