import {CommentType} from "./types/CommentType";
import {ObjectId} from "mongodb";
import {CommentInputModel} from "./types/CommentInputModel";
import {UserType} from "../user/types/UserType";
import {commentRepository} from "./comment.MongoDbRepository";
import {postRepository} from "../post/post.MongoDbRepository";
import {Forbidden} from "../../common/exceptions/Forbidden";

export const commentsService = {
    async addComment(postId: string, commentInputModel: CommentInputModel, currentUser: UserType): Promise<CommentType> {
        const post = await postRepository.get(postId);

        const newComment: CommentType = {
            _id: new ObjectId().toString(),
            content: commentInputModel.content,
            commentatorInfo: {
                userId: currentUser._id,
                userLogin: currentUser.login
            },
            postId: post._id,
            createdAt: new Date().toISOString()
        }

        return await commentRepository.add(newComment);
    },

    async updateUsersComment(commentId: string, userId: string, commentInputModel: CommentInputModel): Promise<boolean | never> {
        const comment = await commentRepository.get(commentId)

        if (comment.commentatorInfo.userId !== userId) {
            throw new Forbidden("You can update only your comments")
        }
        return await commentRepository.updateUsersComment(commentId, userId, commentInputModel)
    },

    async deleteUsersComment(commentId: string, userId: string): Promise<boolean | never> {
        const comment = await commentRepository.get(commentId)

        if (comment.commentatorInfo.userId !== userId) {
            throw new Forbidden("You can delete only your comments")
        }
        return await commentRepository.deleteUsersComment(commentId, userId)
    },
}
