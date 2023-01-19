import {db} from "../db";
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

        db.blogs.push(newBlog)
        return newBlog;
    },

    async findBlogs(): Promise<BlogType[]> {
        return db.blogs;
    },

    async findBlog(id: string): Promise<BlogType | undefined> {
        return db.blogs.find((b) => b.id === id)
    },

    async updateBlog(id: string, blogInputModel: BlogInputModel): Promise<boolean> {
        const blogIndex = db.blogs.findIndex(b => b.id === id);
        if (blogIndex === -1) {
            return false;
        }

        const blog = db.blogs[blogIndex];
        db.blogs[blogIndex] = {
            ...blog,
            name: blogInputModel.name,
            description: blogInputModel.description,
            websiteUrl: blogInputModel.websiteUrl
        };
        return true;
    },

    async deleteBlog(id: string): Promise<boolean> {
        const blogIndex = db.blogs.findIndex((b) => b.id === id);

        if (blogIndex === -1) {
            return false;
        }

        db.blogs.splice(blogIndex, 1);
        return true;
    },

    async deleteAllBlogs(): Promise<void> {
        db.blogs = []
    }
}
