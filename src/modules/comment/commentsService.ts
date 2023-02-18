import {CommentType} from "./types/CommentType";
import {ObjectId} from "mongodb";
import {CommentInputModel} from "./types/CommentInputModel";
import {User} from "../user/types/UserType";
import {CommentRepository} from "./repository/comment.MongoDbRepository";
import {PostRepository} from "../post/repository/post.MongoDbRepository";
import {Forbidden} from "../../common/exceptions/Forbidden";
import {likesOfCommentsRepository} from "./repository/likesOfComments.MongoDbRepository";
import {LikeOfComment} from "./types/LikeOfCommentType";

export class CommentsService {
    private commentRepository: CommentRepository;
    private postRepository: PostRepository;

    constructor() {
        this.commentRepository = new CommentRepository();
        this.postRepository = new PostRepository();
    }

    async addComment(postId: string, commentInputModel: CommentInputModel, currentUser: User): Promise<CommentType> {
        const post = await this.postRepository.get(postId);

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

        return await this.commentRepository.add(newComment);
    }

    async updateUsersComment(commentId: string, userId: string, commentInputModel: CommentInputModel): Promise<boolean | never> {
        const comment = await this.commentRepository.get(commentId)

        if (comment.commentatorInfo.userId !== userId) {
            throw new Forbidden("You can update only your comments")
        }
        return await this.commentRepository.updateUsersComment(commentId, userId, commentInputModel)
    }

    async deleteUsersComment(commentId: string, userId: string): Promise<boolean | never> {
        const comment = await this.commentRepository.get(commentId)

        if (comment.commentatorInfo.userId !== userId) {
            throw new Forbidden("You can delete only your comments")
        }
        return await this.commentRepository.deleteUsersComment(commentId, userId)
    }

    async processLikeStatus(userId: string, commentId: string, likeStatus: string): Promise<boolean | never> {
        const comment = await this.commentRepository.get(commentId)
        const userReaction = await likesOfCommentsRepository.findUserReactionOnTheComment(commentId, userId)

        if (!userReaction) {
            const newUserReactionOnComment = new LikeOfComment(
                userId,
                commentId,
                likeStatus,
            )

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
    }

    async updateLikesAndDislikesCountInComment(commentId: string) {
        const likesCount = await likesOfCommentsRepository.calculateCountOfLikes(commentId);
        const dislikesCount = await likesOfCommentsRepository.calculateCountOfDislikes(commentId);
        await this.commentRepository.updateLikesInfo(commentId, likesCount, dislikesCount)
    }
}

export const commentsService = new CommentsService()
