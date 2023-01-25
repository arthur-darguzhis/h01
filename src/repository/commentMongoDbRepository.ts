import {CommentType} from "../domain/types/CommentType";
import {commentsCollection} from "../db";
import {ObjectId} from "mongodb";
import {CommentInputModel} from "../routes/inputModels/CommentInputModel";
import {CommentViewModel} from "../queryRepository/types/Comment/CommentViewModel";

export const commentRepository = {
    async addComment(newComment: CommentType): Promise<CommentType> {
        await commentsCollection.insertOne(newComment);
        return newComment
    },

    async updateComment(commentId: string, userId: string, commentInputModel: CommentInputModel): Promise<boolean> {
        const result = await commentsCollection.updateOne({
                "_id": new ObjectId(commentId).toString(),
                "commentatorInfo.userId": userId
            },
            {$set: commentInputModel}
        )

        return result.matchedCount === 1;
    },

    async deleteUserComment(commentId: string, userId: string): Promise<boolean> {
        const result = await commentsCollection.deleteOne({
            "_id": new ObjectId(commentId).toString(),
            "commentatorInfo.userId": userId
        })
        return result.deletedCount === 1
    },

    async deleteAllComments(): Promise<void> {
        await commentsCollection.deleteMany({})
    },

    async findComment(commentId: string): Promise<CommentType | null> {
        return await commentsCollection.findOne({_id: new ObjectId(commentId).toString()})
    },
}
