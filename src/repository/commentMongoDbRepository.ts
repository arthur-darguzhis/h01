import {CommentType} from "../domain/types/CommentType";
import {commentsCollection} from "../db";

export const commentRepository = {
    async addComment(newComment: CommentType): Promise<CommentType> {
        await commentsCollection.insertOne(newComment);
        return newComment
    }
}
