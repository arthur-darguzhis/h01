import {blogsCollection} from "../../db";
import {BlogInputModel} from "../../routes/inputModels/BlogInputModel";
import {BlogType} from "../../domain/types/BlogType";
import {DeleteResult} from "mongodb";

export const blogRepository = {

    async addBlog(newBlog: BlogType): Promise<BlogType> {
        await blogsCollection.insertOne(newBlog)
        return newBlog;
    },

    async findBlog(id: string): Promise<BlogType | null> {
        return await blogsCollection.findOne({_id: id});
    },

    async updateBlog(id: string, blog: BlogInputModel): Promise<boolean> {
        const result = await blogsCollection.updateOne({_id: id}, {
            $set: blog
        });

        return result.matchedCount === 1;
    },

    async deleteBlog(id: string): Promise<boolean> {
        const result = await blogsCollection.deleteOne({_id: id});
        return result.deletedCount === 1
    },

    async deleteAllBlogs(): Promise<DeleteResult> {
        return await blogsCollection.deleteMany({})
    }
}
