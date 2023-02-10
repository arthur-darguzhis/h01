import {CommentType} from "../types/CommentType";
import {CommentInputModel} from "../types/CommentInputModel";
import {CommandMongoDbRepository} from "../../../common/repositories/CommandMongoDbRepository";
import {CommentModel} from "../model/CommentModel";

class CommentRepository extends CommandMongoDbRepository<CommentType, CommentInputModel> {
    async updateUsersComment(commentId: string, userId: string, commentInputModel: CommentInputModel): Promise<boolean> {
        const result = await this.model.updateOne({
                "_id": commentId,
                "commentatorInfo.userId": userId
            },
            {$set: commentInputModel}
        )

        return result.modifiedCount === 1;
    }

    async deleteUsersComment(commentId: string, userId: string): Promise<boolean> {
        const result = await this.model.deleteOne({
            "_id": commentId,
            "commentatorInfo.userId": userId
        })
        return result.deletedCount === 1
    }
}

export const commentRepository = new CommentRepository(CommentModel, 'Comment')
