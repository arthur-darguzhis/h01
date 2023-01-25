import {CommentType} from "../domain/types/CommentType";
import {commentsCollection} from "../db";
import {CommentInputModel} from "../routes/inputModels/CommentInputModel";

export const commentRepository = {
    async addComment(newComment: CommentType): Promise<CommentType> {
        await commentsCollection.insertOne(newComment);
        return newComment
    },

    async updateComment(commentId: string, userId: string, commentInputModel: CommentInputModel): Promise<boolean> {
        const result = await commentsCollection.updateOne({
                "_id": commentId,
                "commentatorInfo.userId": userId
            },
            {$set: commentInputModel}
        )

        return result.matchedCount === 1;
    },

    async deleteUserComment(commentId: string, userId: string): Promise<boolean> {
        const result = await commentsCollection.deleteOne({
            "_id": commentId,
            "commentatorInfo.userId": userId
        })
        return result.deletedCount === 1
    },

    async deleteAllComments(): Promise<void> {
        await commentsCollection.deleteMany({})
    },

    async findComment(commentId: string): Promise<CommentType | null> {
        return await commentsCollection.findOne({_id: commentId})
    },
}
