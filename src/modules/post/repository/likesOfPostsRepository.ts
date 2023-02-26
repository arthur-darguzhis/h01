import {injectable} from "inversify";
import {LikeOfPost} from "../types/LikeOfPost";
import {LikeOfPostModel} from "../model/LikeOfPostModel";
import {LikeOfComment} from "../../comment/types/LikeOfCommentType";

@injectable()
export class LikesOfPostsRepository {
    async add(likesOfPost: LikeOfPost): Promise<LikeOfPost> {
        await LikeOfPostModel.create(likesOfPost)
        return likesOfPost
    }

    async updateLikeStatus(id: string, likeStatus: string): Promise<boolean> {
        const result = await LikeOfPostModel.updateOne({_id: id}, {status: likeStatus})
        return result.modifiedCount === 1;
    }

    async calculateCountOfLikes(postId: string) {
        return LikeOfPostModel.countDocuments({
            postId: postId,
            status: LikeOfComment.LIKE_STATUS_OPTIONS.LIKE
        });
    }

    async calculateCountOfDislikes(postId: string) {
        return LikeOfPostModel.countDocuments({
            postId: postId,
            status: LikeOfComment.LIKE_STATUS_OPTIONS.DISLIKE
        });
    }

    async findUserReactionOnThePost(postId: string, userId: string): Promise<LikeOfPost | null> {
        return LikeOfPostModel.findOne({userId: userId, postId: postId})
    }

    async getNewestLikesOnThePost(postId: string): Promise<Array<LikeOfPost> | null> {
        return LikeOfPostModel
            .find({
                postId: postId,
                status: LikeOfPost.LIKE_STATUS_OPTIONS.LIKE
            })
            .select('-_id addedAt userId login')
            .sort({addedAt: "desc"})
            .limit(3).lean()
    }

    async getUserReactionOnPostsBunch(postIdList: Array<string>, userId: string) {
        return LikeOfPostModel.find({postId: {"$in": postIdList}, userId: userId}).lean();
    }
}
