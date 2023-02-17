import {BlogInputModel} from "./types/BlogInputModel";
import {BlogType} from "./types/BlogType";
import {blogRepository} from "./repository/blog.MongoDbRepository";
import {ObjectId} from "mongodb";

class BlogsService {
    async createBlog(blogInputModel: BlogInputModel): Promise<BlogType> {
        const newBlog: BlogType = {
            _id: new ObjectId().toString(),
            name: blogInputModel.name,
            description: blogInputModel.description,
            websiteUrl: blogInputModel.websiteUrl,
            createdAt: new Date().toISOString()
        }
        return await blogRepository.add(newBlog)
    }

    async updateBlog(id: string, blogInputModel: BlogInputModel): Promise<boolean> {
        const updatedBlog: BlogInputModel = {
            name: blogInputModel.name,
            description: blogInputModel.description,
            websiteUrl: blogInputModel.websiteUrl
        }
        const blog = await blogRepository.get(id);
        return await blogRepository.update(blog._id, updatedBlog);
    }

    async deleteBlog(id: string): Promise<boolean> {
        const blog = await blogRepository.get(id);
        return await blogRepository.delete(blog._id)
    }
}

export const blogsService = new BlogsService()
