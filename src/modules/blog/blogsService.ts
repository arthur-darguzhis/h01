import {BlogInputModel} from "./types/BlogInputModel";
import {Blog} from "./types/BlogType";
import {blogRepository} from "./repository/blog.MongoDbRepository";

export class BlogsService {
    async createBlog(blogInputModel: BlogInputModel): Promise<Blog> {
        const newBlog = new Blog(
            blogInputModel.name,
            blogInputModel.description,
            blogInputModel.websiteUrl,
        )
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
