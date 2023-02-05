import {CommentType} from "./types/CommentType";
import {dbConnection} from "../../db";
import {CommentInputModel} from "./types/CommentInputModel";
import {CommandMongoDbRepository} from "../../common/repositories/CommandMongoDbRepository";

class CommentRepository extends CommandMongoDbRepository<CommentType, CommentInputModel> {
    async updateUsersComment(commentId: string, userId: string, commentInputModel: CommentInputModel): Promise<boolean> {
        const result = await this.collection.updateOne({
                "_id": commentId,
                "commentatorInfo.userId": userId
            },
            {$set: commentInputModel}
        )

        return result.matchedCount === 1;
    }

    async deleteUsersComment(commentId: string, userId: string): Promise<boolean> {
        const result = await this.collection.deleteOne({
            "_id": commentId,
            "commentatorInfo.userId": userId
        })
        return result.deletedCount === 1
    }
}

export const commentRepository = new CommentRepository(dbConnection, 'comments')
