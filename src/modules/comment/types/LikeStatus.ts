export const LIKE_STATUSES = {
    NONE: "None",
    LIKE: "Like",
    DISLIKE: "Dislike"
};

export type LikeStatus = typeof LIKE_STATUSES[keyof typeof LIKE_STATUSES];
