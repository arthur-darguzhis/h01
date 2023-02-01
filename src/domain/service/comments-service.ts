import {CommentType} from "../types/CommentType";
import {ObjectId} from "mongodb";
import {CommentInputModel} from "../../routes/inputModels/CommentInputModel";
import {UserType} from "../types/UserType";
import {commentRepository} from "../../repository/commentMongoDbRepository";
import {postRepository} from "../../repository/postMongoDbRepository";
import {EntityNotFound} from "../exceptions/EntityNotFound";
import {Forbidden} from "../exceptions/Forbidden";

export const commentsService = {
    async addComment(postId: string, commentInputModel: CommentInputModel, currentUser: UserType): Promise<CommentType> {
        const post = await postRepository.findPost(postId);
        if (!post) {
            throw new Error(`Post with ID: ${postId} is not exists`);
        }

        const newComment: CommentType = {
            _id: new ObjectId().toString(),
            content: commentInputModel.content,
            commentatorInfo: {
                userId: currentUser._id,
                userLogin: currentUser.login
            },
            postId: postId,
            createdAt: new Date().toISOString()
        }

        return await commentRepository.addComment(newComment);
    },

    async updateUsersComment(commentId: string, userId: string, commentInputModel: CommentInputModel): Promise<boolean | never> {
        const comment = await commentRepository.findComment(commentId)
        if (!comment) {
            throw new EntityNotFound(`Comment id: ${commentId} is not exists`)
        }

        if (comment.commentatorInfo.userId !== userId) {
            throw new Forbidden("You can update only your comments")
        }
        return await commentRepository.updateComment(commentId, userId, commentInputModel)
    },

    async deleteUserComment(commentId: string, userId: string): Promise<boolean | never> {
        const comment = await commentRepository.findComment(commentId)
        if (!comment) {
            throw new EntityNotFound(`Comment id: ${commentId} is not exists`)
        }

        if (comment.commentatorInfo.userId !== userId) {
            throw new Forbidden("You can delete only your comments")
        }
        return await commentRepository.deleteUserComment(commentId, userId)
    },

    async deleteAllComments(): Promise<void> {
        await commentRepository.deleteAllComments()
    },
}
