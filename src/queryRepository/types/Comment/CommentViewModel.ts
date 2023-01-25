import {CommentatorInfo} from "../../../domain/types/CommentType";

export type CommentViewModel = {
    id: string
    content: string
    commentatorInfo: CommentatorInfo
    createdAt: string
}
