import {LIKE_STATUSES} from "./LikeStatus";

export type LikeOfCommentType = {
    _id: string,
    userId: string,
    commentId: string,
    status: typeof LIKE_STATUSES[keyof typeof LIKE_STATUSES],
    createdAt: string,
}
