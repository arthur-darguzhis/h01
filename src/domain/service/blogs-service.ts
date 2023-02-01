import {BlogInputModel} from "../../routes/inputModels/BlogInputModel";
import {BlogType} from "../types/BlogType";
import {blogRepository} from "../../repository/blogMongoDbRepository";
import {ObjectId} from "mongodb";

export const blogsService = {

    async createBlog(blogInputModel: BlogInputModel): Promise<BlogType> {
        const newBlog: BlogType = {
            _id: new ObjectId().toString(),
            name: blogInputModel.name,
            description: blogInputModel.description,
            websiteUrl: blogInputModel.websiteUrl,
            createdAt: new Date().toISOString()
        }
        return await blogRepository.addBlog(newBlog)
    },

    async updateBlog(id: string, blogInputModel: BlogInputModel): Promise<boolean> {
        const updatedBlog: BlogInputModel = {
            name: blogInputModel.name,
            description: blogInputModel.description,
            websiteUrl: blogInputModel.websiteUrl
        }
        return await blogRepository.updateBlog(id, updatedBlog);
    },

    async deleteBlog(id: string): Promise<boolean> {
        return await blogRepository.deleteBlog(id)
    },

    async deleteAllBlogs(): Promise<void> {
        await blogRepository.deleteAllBlogs()
    },
}
