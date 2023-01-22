import {blogsCollection, client} from "../db";
import {BlogInputModel} from "../routes/inputModels/BlogInputModel";
import {BlogType} from "../domain/types/BlogType";

export const blogRepository = {

    async createBlog(newBlog: BlogType): Promise<BlogType> {
        await blogsCollection.insertOne(newBlog)
        return newBlog;
    },

    async findBlog(id: string): Promise<BlogType | null> {
        return await blogsCollection.findOne({id: id});
    },

    async updateBlog(id: string, blog: BlogInputModel): Promise<boolean> {
        const result = await blogsCollection.updateOne({id: id}, {
            $set: blog
        });

        return result.matchedCount === 1;
    },

    async deleteBlog(id: string): Promise<boolean> {
        const result = await blogsCollection.deleteOne({id: id});
        return result.deletedCount === 1
    },

    async deleteAllBlogs(): Promise<void> {
        await blogsCollection.deleteMany({})
    }
}
