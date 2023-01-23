import {UserViewModel} from "./UserViewModel";

export type UserPaginatorType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: UserViewModel[]
}
