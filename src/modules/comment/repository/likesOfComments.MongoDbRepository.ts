import {CommandMongoDbRepository} from "../../../common/repositories/CommandMongoDbRepository";
import {LikeOfCommentType} from "../types/LikeOfCommentType";
import {LikeOfCommentModel} from "../model/likeOfCommentModel";
import {LIKE_STATUSES} from "../types/LikeStatus";

class LikesOfCommentsRepository extends CommandMongoDbRepository<LikeOfCommentType, { status: string }> {
    async findUserReactionOnTheComment(commentId: string, userId: string): Promise<LikeOfCommentType | null> {
        return this.model.findOne({userId: userId, commentId: commentId})
    }

    async updateLikeStatus(id: string, likeStatus: string): Promise<boolean> {
        const result = await this.model.updateOne({_id: id}, {status: likeStatus})
        return result.modifiedCount === 1;
    }

    async calculateCountOfLikes(commentId: string) {
        return this.model.countDocuments({commentId: commentId, status: LIKE_STATUSES.LIKE});
    }

    async calculateCountOfDislikes(commentId: string) {
        return this.model.countDocuments({commentId: commentId, status: LIKE_STATUSES.DISLIKE});
    }

    async getUserReactionOnCommentsBunch(commentsIdList: Array<string>, userId: string) {
        return this.model.find({commentId: {"$in": commentsIdList}, userId: userId}).lean();
    }
}

export const likesOfCommentsRepository = new LikesOfCommentsRepository(LikeOfCommentModel, "Like for comment")
