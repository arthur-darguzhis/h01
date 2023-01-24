import {blogsCollection} from "../db";
import {BlogInputModel} from "../routes/inputModels/BlogInputModel";
import {BlogType} from "../domain/types/BlogType";
import {ObjectId} from "mongodb";

export const blogRepository = {

    async addBlog(newBlog: BlogType): Promise<BlogType> {
        await blogsCollection.insertOne(newBlog)
        return newBlog;
    },

    async findBlog(id: string): Promise<BlogType | null> {
        return await blogsCollection.findOne({_id: new ObjectId(id).toString()});
    },

    async updateBlog(id: string, blog: BlogInputModel): Promise<boolean> {
        const result = await blogsCollection.updateOne({_id: new ObjectId(id).toString()}, {
            $set: blog
        });

        return result.matchedCount === 1;
    },

    async deleteBlog(id: string): Promise<boolean> {
        const result = await blogsCollection.deleteOne({_id: new ObjectId(id).toString()});
        return result.deletedCount === 1
    },

    async deleteAllBlogs(): Promise<void> {
        await blogsCollection.deleteMany({})
    }
}
