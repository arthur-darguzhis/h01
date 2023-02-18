import {CommentType} from "../types/CommentType";
import {CommentInputModel} from "../types/CommentInputModel";
import {CommentModel} from "../model/CommentModel";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";

export class CommentRepository {
    async add(comment: CommentType): Promise<CommentType> {
        await CommentModel.create(comment)
        return comment
    }

    async find(id: string): Promise<CommentType | null> {
        return CommentModel.findOne({_id: id});
    }

    async get(id: string): Promise<CommentType | never> {
        const comment = await CommentModel.findOne({_id: id});
        if (!comment) throw new EntityNotFound(`Comment with ID: ${id} is not exists`);
        return comment
    }

    async update(id: string, updateFilter: CommentInputModel): Promise<boolean> {
        const result = await CommentModel.updateOne({_id: id}, {$set: updateFilter})
        return result.modifiedCount === 1;
    }

    async delete(id: string): Promise<boolean> {
        const result = await CommentModel.deleteOne({_id: id});
        return result.deletedCount === 1;
    }

    async updateUsersComment(commentId: string, userId: string, commentInputModel: CommentInputModel): Promise<boolean> {
        const result = await CommentModel.updateOne({
                "_id": commentId,
                "commentatorInfo.userId": userId
            },
            {$set: commentInputModel}
        )

        return result.modifiedCount === 1;
    }

    async deleteUsersComment(commentId: string, userId: string): Promise<boolean> {
        const result = await CommentModel.deleteOne({
            "_id": commentId,
            "commentatorInfo.userId": userId
        })
        return result.deletedCount === 1
    }

    async updateLikesInfo(commentId: string, likesCount: number, dislikeCount: number): Promise<boolean> {
        const result = await CommentModel.updateOne(
            {"_id": commentId,},
            {
                $set: {
                    "likesInfo.likesCount": likesCount,
                    "likesInfo.dislikesCount": dislikeCount
                }
            }
        )
        return result.modifiedCount === 1;
    }
}

export const commentRepository = new CommentRepository()
