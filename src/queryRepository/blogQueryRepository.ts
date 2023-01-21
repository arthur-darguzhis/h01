import {BlogViewModel} from "./types/BlogViewModel";
import {BlogType} from "../domain/types/BlogType";
import {blogsCollection} from "../db";

// _mapBlogToBlogViewModel
export const convertBlogToViewModel = (blog: BlogType): BlogViewModel => {
    return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
    }
}

export const blogQueryRepository = {

    async findBlogs(): Promise<BlogType[]> {
        return blogsCollection.find({}).toArray()
    },

    async findBlog(id: string): Promise<BlogType | null> {
        return await blogsCollection.findOne({id: id});
    },
}
