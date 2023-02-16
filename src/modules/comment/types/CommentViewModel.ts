import {CommentatorInfo, CommentLikeInfo} from "./CommentType";

export type CommentViewModel = {
    id: string
    content: string
    commentatorInfo: CommentatorInfo
    createdAt: string
    likesInfo: CommentLikeInfo & { myStatus: string }
}
