import {blogsCollection, client} from "../db";
import {BlogInputModel} from "../model/blog/BlogInputModel";
import {BlogType} from "../types/BlogType";

export const blogRepository = {

    async createBlog(blogInputModel: BlogInputModel): Promise<BlogType> {
        const newBlog: BlogType = {
            id: new Date().getTime().toString(),
            name: blogInputModel.name,
            description: blogInputModel.description,
            websiteUrl: blogInputModel.websiteUrl,
            createdAt: new Date().toISOString()
        }

        await blogsCollection.insertOne(newBlog)
        return newBlog;
    },

    async getBlogs(): Promise<BlogType[]> {
        //Здесь вопрос почему в этом методе нет await а в других есть?
        return await blogsCollection.find({}).toArray();
    },

    async getBlogById(id: string): Promise<BlogType | null> {
        return await blogsCollection.findOne({id: id});
    },

    async updateBlogById(id: string, blogInputModel: BlogInputModel): Promise<boolean> {
        const result = await blogsCollection.updateOne({id: id}, {
            $set: {
                id: id,
                name: blogInputModel.name,
                description: blogInputModel.description,
                websiteUrl: blogInputModel.websiteUrl
            }
        });

        return result.matchedCount === 1;
    },

    async deleteBlogById(id: string): Promise<boolean> {
        const result = await blogsCollection.deleteOne({id: id});
        return result.deletedCount === 1
    },

    async deleteAllBlogs(): Promise<void> {
        await blogsCollection.deleteMany({})
    }
}
