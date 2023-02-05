import {PaginatorParams} from "../../auth/types/paginator/PaginatorParams";

export type UserPaginatorParams = PaginatorParams & {
    searchLoginTerm: string | undefined,
    searchEmailTerm: string | undefined,
}
