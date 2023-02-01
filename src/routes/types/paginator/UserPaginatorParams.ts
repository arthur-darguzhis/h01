import {PaginatorParams} from "./PaginatorParams";

export type UserPaginatorParams = PaginatorParams & {
    searchLoginTerm: string | undefined,
    searchEmailTerm: string | undefined,
}
