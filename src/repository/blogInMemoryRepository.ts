import {db} from "../db";
import {BlogInputModel} from "../model/blog/BlogInputModel";
import {BlogType} from "../types/BlogType";

export const blogRepository = {
    createBlog(blogInputModel: BlogInputModel): BlogType {
        const newBlog: BlogType = {
            id: new Date().getTime().toString(),
            name: blogInputModel.name,
            description: blogInputModel.description,
            websiteUrl: blogInputModel.websiteUrl
        }

        db.blogs.push(newBlog)
        return newBlog;
    },

    getBlogs(): BlogType[] {
        return db.blogs;
    },

    getBlogById(id: string): BlogType | undefined {
        return db.blogs.find((b) => b.id === id)
    },

    updateBlogById(id: string, blogInputModel: BlogInputModel): boolean {
        const blogIndex = db.blogs.findIndex(b => b.id === id);
        if (blogIndex === -1) {
            return false;
        }

        db.blogs[blogIndex] = {
            id: id,
            name: blogInputModel.name,
            description: blogInputModel.description,
            websiteUrl: blogInputModel.websiteUrl
        };
        return true;
    },

    deleteBlogById(id: string): boolean {
        const blogIndex = db.blogs.findIndex((b) => b.id === id);

        if (blogIndex === -1) {
            return false;
        }

        db.blogs.splice(blogIndex, 1);
        return true;
    },

    deleteAllBlogs() {
        db.blogs = []
    }
}
