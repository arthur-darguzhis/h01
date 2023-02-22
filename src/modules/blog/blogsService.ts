import {BlogInputModel} from "./types/BlogInputModel";
import {Blog} from "./types/BlogType";
import {BlogRepository} from "./repository/blog.MongoDbRepository";
import {injectable} from "inversify";

@injectable()
export class BlogsService {
    constructor(
        protected blogRepository: BlogRepository
    ) {
    }

    async createBlog(blogInputModel: BlogInputModel): Promise<Blog> {
        const newBlog = new Blog(
            blogInputModel.name,
            blogInputModel.description,
            blogInputModel.websiteUrl,
        )
        return await this.blogRepository.add(newBlog)
    }

    async updateBlog(id: string, blogInputModel: BlogInputModel): Promise<boolean> {
        const updatedBlog: BlogInputModel = {
            name: blogInputModel.name,
            description: blogInputModel.description,
            websiteUrl: blogInputModel.websiteUrl
        }
        const blog = await this.blogRepository.get(id);
        return await this.blogRepository.update(blog._id, updatedBlog);
    }

    async deleteBlog(id: string): Promise<boolean> {
        const blog = await this.blogRepository.get(id);
        return await this.blogRepository.delete(blog._id)
    }
}
