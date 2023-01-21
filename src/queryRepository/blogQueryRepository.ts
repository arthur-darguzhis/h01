import {BlogViewModel} from "./types/BlogViewModel";
import {BlogType} from "../domain/types/BlogType";
import {blogsCollection} from "../db";

const _mapBlogToViewModel = (blog: BlogType): BlogViewModel => {
    //Делаем ручной маппинг почему?)
    return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
    }
}

export const blogQueryRepository = {

    async findBlogs(): Promise<BlogViewModel[]> {
        const blogs = await blogsCollection.find({}).toArray()
        return blogs.map(_mapBlogToViewModel);
    },

    async findBlog(id: string): Promise<BlogViewModel | null> {
        const blog = await blogsCollection.findOne({id: id});
        return blog ? _mapBlogToViewModel(blog) : null;
    },
}
