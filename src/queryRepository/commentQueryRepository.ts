import {CommentType} from "../domain/types/CommentType";
import {commentsCollection} from "../db";
import {ObjectId} from "mongodb";
import {CommentViewModel} from "./types/Comment/CommentViewModel";

const _mapCommentToViewModel = (comment: CommentType): CommentViewModel => {
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

export const commentQueryRepository = {
    async findComment(commentId: string): Promise<CommentViewModel | null> {
        const comment = await commentsCollection.findOne({_id: new ObjectId(commentId).toString()})
        return comment ? _mapCommentToViewModel(comment) : null
    }
}
