import {BlogInputModel} from "../../routes/inputModels/BlogInputModel";
import {BlogType} from "../types/BlogType";
import {blogRepository} from "../../repository/blogMongoDbRepository";

export const blogsService = {

    async createBlog(blogInputModel: BlogInputModel): Promise<string> {
        const newBlog: BlogType = {
            id: new Date().getTime().toString(),
            name: blogInputModel.name,
            description: blogInputModel.description,
            websiteUrl: blogInputModel.websiteUrl,
            createdAt: new Date().toISOString()
        }
        const blog = await blogRepository.createBlog(newBlog)
        return blog.id
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
