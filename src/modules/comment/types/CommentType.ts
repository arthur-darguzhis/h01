export type CommentType = {
    _id: string
    content: string
    commentatorInfo: CommentatorInfo
    postId: string
    createdAt: string
}

export type CommentatorInfo = {
    userId: string
    userLogin: string
}
