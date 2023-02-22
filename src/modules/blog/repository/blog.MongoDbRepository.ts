import {BlogInputModel} from "../types/BlogInputModel";
import {Blog} from "../types/BlogType";
import {BlogModel} from "../model/BlogModel";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";
import {injectable} from "inversify";

@injectable()
export class BlogRepository {
    async add(blog: Blog): Promise<Blog> {
        await BlogModel.create(blog)
        return blog
    }

    async isExists(id: string): Promise<boolean> {
        const blog = await BlogModel.findOne({_id: id})
        return !!blog;
    }

    async find(id: string): Promise<Blog | null> {
        return BlogModel.findOne({_id: id});
    }

    async get(id: string): Promise<Blog | never> {
        const blog = await BlogModel.findOne({_id: id});
        if (!blog) throw new EntityNotFound(`Blog with ID: ${id} is not exists`);
        return blog
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
