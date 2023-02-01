import {CommentType} from "../../domain/types/CommentType";
import {CommentViewModel} from "../../queryRepository/types/Comment/CommentViewModel";

export const mapCommentToViewModel = (comment: CommentType): CommentViewModel => {
    return {
        id: comment._id,
        content: comment.content,
        commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin
        },
        createdAt: comment.createdAt
    }
}
