import {BlogInputModel} from "../types/BlogInputModel";
import {BlogType} from "../types/BlogType";
import {BlogModel} from "../model/BlogModel";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";

export class BlogRepository {
    async add(newEntity: BlogType): Promise<BlogType> {
        await BlogModel.create(newEntity)
        return newEntity
    }

    async isExists(id: string): Promise<boolean> {
        const entity = await BlogModel.findOne({_id: id})
        return !!entity;
    }

    async find(id: string): Promise<BlogType | null> {
        return BlogModel.findOne({_id: id});
    }

    async get(id: string): Promise<BlogType | never> {
        const entity = await BlogModel.findOne({_id: id});
        if (!entity) throw new EntityNotFound(`Blog with ID: ${id} is not exists`);
        return entity
    }

    async update(id: string, updateFilter: BlogInputModel): Promise<boolean> {
        const result = await BlogModel.updateOne({_id: id}, {$set: updateFilter})
        return result.modifiedCount === 1;
    }

    async delete(id: string): Promise<boolean> {
        const result = await BlogModel.deleteOne({_id: id});
        return result.deletedCount === 1;
    }
}

export const blogRepository = new BlogRepository()
