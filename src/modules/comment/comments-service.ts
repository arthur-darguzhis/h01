import {CommentType} from "./types/CommentType";
import {ObjectId} from "mongodb";
import {CommentInputModel} from "./types/CommentInputModel";
import {UserType} from "../user/types/UserType";
import {commentRepository} from "./repository/comment.MongoDbRepository";
import {postRepository} from "../post/repository/post.MongoDbRepository";
import {Forbidden} from "../../common/exceptions/Forbidden";
import {LikeStatus} from "./types/LikeStatus";
import {likesOfCommentsRepository} from "./repository/likesOfComments.MongoDbRepository";
import {LikeOfCommentType} from "./types/LikeOfCommentType";

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
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
            }
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

    async processLikeStatus(userId: string, commentId: string, likeStatus: LikeStatus): Promise<boolean | never> {
        const comment = await commentRepository.get(commentId)
        const userReaction = await likesOfCommentsRepository.findUserReactionOnTheComment(commentId, userId)

        if (!userReaction) {
            const newUserReactionOnComment: LikeOfCommentType = {
                _id: new ObjectId().toString(),
                userId: userId,
                commentId: commentId,
                status: likeStatus,
                createdAt: new Date().toISOString()
            }
            await likesOfCommentsRepository.add(newUserReactionOnComment)
        } else {
            const previousLikeStatus = userReaction.status
            if (previousLikeStatus === likeStatus) {
                return true;
            }
            await likesOfCommentsRepository.updateLikeStatus(userReaction._id, likeStatus)
        }
        await this.updateLikesAndDislikesCountInComment(comment._id)
        return true;
    },

    async updateLikesAndDislikesCountInComment(commentId: string) {
        const likesCount = await likesOfCommentsRepository.calculateCountOfLikes(commentId);
        const dislikesCount = await likesOfCommentsRepository.calculateCountOfDislikes(commentId);
        await commentRepository.updateLikesInfo(commentId, likesCount, dislikesCount)
    },
}
