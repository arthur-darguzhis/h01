import {db} from "../db";
import {PostInputModel} from "../model/post/PostInputModel";
import {PostType} from "../types/PostType";
import {blogRepository} from "./blogRepository";

export const postRepository = {
    createPost(postInputModel: PostInputModel): PostType | false {
        const blog = blogRepository.getBlogById(postInputModel.blogId);
        if (!blog) {
            return false;
        }

        const newPost: PostType = {
            id: new Date().getTime().toString(),
            title: postInputModel.title,
            shortDescription: postInputModel.shortDescription,
            content: postInputModel.content,
            blogId: postInputModel.blogId,
            blogName: blog.name,
        }

        db.posts.push(newPost);
        return newPost;
    },

    getPosts(): PostType[] {
        return db.posts;
    },

    getPostsById(id: string): PostType | undefined {
        return db.posts.find((p) => p.id === id)
    },

    updatePostById(id: string, postInputModel: PostInputModel): boolean {
        const postIndex = db.posts.findIndex(b => b.id === id);
        const blog = blogRepository.getBlogById(postInputModel.blogId);
        if (postIndex === -1 || !blog) {
            return false;
        }

        db.posts[postIndex] = {
            id: id,
            title: postInputModel.title,
            shortDescription: postInputModel.shortDescription,
            content: postInputModel.content,
            blogId: postInputModel.blogId,
            blogName: blog.name
        };
        return true;
    },

    deletePostById(id: string): boolean {
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
