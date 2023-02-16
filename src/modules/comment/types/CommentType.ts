export type CommentType = {
    _id: string
    content: string
    commentatorInfo: CommentatorInfo
    postId: string
    createdAt: string
    likesInfo: CommentLikeInfo
}

export type CommentatorInfo = {
    userId: string
    userLogin: string
}

export type CommentLikeInfo = {
    likesCount: number
    dislikesCount: number
}
