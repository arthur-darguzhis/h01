import {CommentType} from "../types/CommentType";
import {ObjectId} from "mongodb";
import {CommentInputModel} from "../../routes/inputModels/CommentInputModel";
import {UserType} from "../types/UserType";
import {commentRepository} from "../../repository/commentMongoDbRepository";
import {postRepository} from "../../repository/postMongoDbRepository";

export const commentService = {
    async addComment(postId: string, commentInputModel: CommentInputModel, currentUser: UserType): Promise<string> {
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
            createdAt: new Date().toISOString()
        }
        await commentRepository.addComment(newComment);
        return newComment._id;
    }
}
