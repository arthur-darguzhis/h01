import {CommentType} from "./types/CommentType";
import {CommentViewModel} from "./types/CommentViewModel";
import {LikeOfComment} from "./types/LikeOfCommentType";

export const mapCommentToViewModel = (comment: CommentType, myStatus: string = LikeOfComment.LIKE_STATUS_OPTIONS.NONE): CommentViewModel => {
    return {
        id: comment._id,
        content: comment.content,
        commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin
        },
        createdAt: comment.createdAt,
        likesInfo: {
            likesCount: comment.likesInfo.likesCount,
            dislikesCount: comment.likesInfo.dislikesCount,
            myStatus: myStatus
        }
    }
}
