import {PostInputModel} from "../types/PostInputModel";
import {Post} from "../types/PostType";
import {PostModel} from "../types/PostModel";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";

class PostRepository {
    async add(newEntity: Post): Promise<Post> {
        await PostModel.create(newEntity)
        return newEntity
    }

    async find(id: string): Promise<Post | null> {
        return PostModel.findOne({_id: id});
    }

    async get(id: string): Promise<Post | never> {
        const entity = await PostModel.findOne({_id: id});
        if (!entity) throw new EntityNotFound(`Post with ID: ${id} is not exists`);
        return entity
    }

    async update(id: string, updateFilter: PostInputModel): Promise<boolean> {
        const result = await PostModel.updateOne({_id: id}, {$set: updateFilter})
        return result.modifiedCount === 1;
    }

    async delete(id: string): Promise<boolean> {
        const result = await PostModel.deleteOne({_id: id});
        return result.deletedCount === 1;
    }
}

export const postRepository = new PostRepository();
