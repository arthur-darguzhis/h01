import {LikeOfComment} from "../types/LikeOfCommentType";
import {LikeOfCommentModel} from "../model/likeOfCommentModel";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";

class LikesOfCommentsRepository {
    async add(likeOfComment: LikeOfComment): Promise<LikeOfComment> {
        await LikeOfCommentModel.create(likeOfComment)
        return likeOfComment
    }

    async find(id: string): Promise<LikeOfComment | null> {
        return LikeOfCommentModel.findOne({_id: id});
    }

    async get(id: string): Promise<LikeOfComment | never> {
        const likeOfComment = await LikeOfCommentModel.findOne({_id: id});
        if (!likeOfComment) throw new EntityNotFound(`Like for comment with ID: ${id} is not exists`);
        return likeOfComment
    }

    async update(id: string, updateFilter: { status: string }): Promise<boolean> {
        const result = await LikeOfCommentModel.updateOne({_id: id}, {$set: updateFilter})
        return result.modifiedCount === 1;
    }

    async delete(id: string): Promise<boolean> {
        const result = await LikeOfCommentModel.deleteOne({_id: id});
        return result.deletedCount === 1;
    }

    async findUserReactionOnTheComment(commentId: string, userId: string): Promise<LikeOfComment | null> {
        return LikeOfCommentModel.findOne({userId: userId, commentId: commentId})
    }

    async updateLikeStatus(id: string, likeStatus: string): Promise<boolean> {
        const result = await LikeOfCommentModel.updateOne({_id: id}, {status: likeStatus})
        return result.modifiedCount === 1;
    }

    async calculateCountOfLikes(commentId: string) {
        return LikeOfCommentModel.countDocuments({
            commentId: commentId,
            status: LikeOfComment.LIKE_STATUS_OPTIONS.LIKE
        });
    }

    async calculateCountOfDislikes(commentId: string) {
        return LikeOfCommentModel.countDocuments({
            commentId: commentId,
            status: LikeOfComment.LIKE_STATUS_OPTIONS.DISLIKE
        });
    }

    async getUserReactionOnCommentsBunch(commentsIdList: Array<string>, userId: string) {
        return LikeOfCommentModel.find({commentId: {"$in": commentsIdList}, userId: userId}).lean();
    }
}

export const likesOfCommentsRepository = new LikesOfCommentsRepository()
