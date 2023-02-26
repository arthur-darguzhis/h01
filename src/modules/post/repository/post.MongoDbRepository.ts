import {PostInputModel} from "../types/PostInputModel";
import {Post} from "../types/PostType";
import {PostModel} from "../model/PostModel";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";
import {injectable} from "inversify";

@injectable()
export class PostRepository {
    async add(post: Post): Promise<Post> {
        await PostModel.create(post)
        return post
    }

    async find(id: string): Promise<Post | null> {
        return PostModel.findOne({_id: id});
    }

    async get(id: string): Promise<Post | never> {
        const post = await PostModel.findOne({_id: id});
        if (!post) throw new EntityNotFound(`Post with ID: ${id} is not exists`);
        return post
    }

    async update(id: string, updateFilter: PostInputModel): Promise<boolean> {
        const result = await PostModel.updateOne({_id: id}, {$set: updateFilter})
        return result.modifiedCount === 1;
    }

    async delete(id: string): Promise<boolean> {
        const result = await PostModel.deleteOne({_id: id});
        return result.deletedCount === 1;
    }

    async updateLikesInfo(postId: string, likesCount: number, dislikeCount: number, newestLikes: any): Promise<boolean> {
        const result = await PostModel.updateOne(
            {"_id": postId,},
            {
                $set: {
                    "extendedLikesInfo.likesCount": likesCount,
                    "extendedLikesInfo.dislikesCount": dislikeCount,
                    "extendedLikesInfo.newestLikes": newestLikes,
                }
            }
        )
        return result.modifiedCount === 1;
    }
}
