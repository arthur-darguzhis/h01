import {LIKE_STATUSES} from "./LikeStatus";

export type LikesInfoViewModel = {
    likesCount: number,
    dislikesCount: number,
    myStatus: typeof LIKE_STATUSES[keyof typeof LIKE_STATUSES];
}
