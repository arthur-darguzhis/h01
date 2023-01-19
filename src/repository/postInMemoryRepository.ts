import {db} from "../db";
import {PostInputModel} from "../model/post/PostInputModel";
import {PostType} from "../types/PostType";
import {blogRepository} from "./blogInMemoryRepository";

export const postRepository = {
    async createPost(postInputModel: PostInputModel): Promise<PostType | never> {
        const blog = await blogRepository.findBlog(postInputModel.blogId);
        if (!blog) {
            throw new Error(`Blog with ID: ${postInputModel.blogId} is not exists`);
        }

        const newPost: PostType = {
            id: new Date().getTime().toString(),
            title: postInputModel.title,
            shortDescription: postInputModel.shortDescription,
            content: postInputModel.content,
            blogId: postInputModel.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString()
        }

        db.posts.push(newPost);
        return newPost;
    },

    async findPosts(): Promise<PostType[]> {
        return db.posts;
    },

    async findPost(id: string): Promise<PostType | undefined> {
        return db.posts.find((p) => p.id === id)
    },

    async updatePost(id: string, postInputModel: PostInputModel): Promise<boolean | never> {
        const postIndex = db.posts.findIndex(b => b.id === id);
        if (postIndex === -1) {
            throw new Error(`Post with ID: ${id} is not exists`)
        }

        const blog = await blogRepository.findBlog(postInputModel.blogId);
        if (!blog) {
            throw new Error(`Blog with ID: ${id} is not exists`)
        }
        const post = db.posts[postIndex]
        db.posts[postIndex] = {
            ...post,
            title: postInputModel.title,
            shortDescription: postInputModel.shortDescription,
            content: postInputModel.content,
            blogId: postInputModel.blogId,
            blogName: blog.name
        };
        return true;
    },

    async deletePost(id: string): Promise<boolean> {
        const postIndex = db.posts.findIndex((b) => b.id === id);

        if (postIndex === -1) {
            return false;
        }

        db.posts.splice(postIndex, 1);
        return true;
    },

    deleteAllPosts() {
        db.posts = []
    }
}
