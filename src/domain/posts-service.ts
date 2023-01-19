import {postRepository} from '../repository/postMongoDbRepository'
import {blogRepository} from '../repository/blogMongoDbRepository'
import {PostInputModel} from "../model/post/PostInputModel";
import {PostType} from "../types/PostType";

export const postsService = {
    async createPost(postInputModel: PostInputModel): Promise<PostType | never> {
        const blog = await blogRepository.findBlog(postInputModel.blogId);
        if (!blog) {
            throw new Error(`Blog with ID: ${postInputModel.blogId} is not exists`);
        }

        const newPost = {
            id: new Date().getTime().toString(),
            title: postInputModel.title,
            shortDescription: postInputModel.shortDescription,
            content: postInputModel.content,
            blogId: postInputModel.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString()
        }

        return await postRepository.createPost(newPost)
    },

    async findPosts(): Promise<PostType[]> {
        return postRepository.findPosts();
    },

    async findPost(id: string): Promise<PostType | null> {
        return await postRepository.findPost(id)
    },

    async updatePost(id: string, postInputModel: PostInputModel): Promise<boolean | never> {
        const blog = await blogRepository.findBlog(postInputModel.blogId);
        if (!blog) {
            throw new Error(`Blog with ID: ${id} is not exists`)
        }

        const updatedPost: PostInputModel = {
            title: postInputModel.title,
            shortDescription: postInputModel.shortDescription,
            content: postInputModel.content,
            blogId: postInputModel.blogId,
            blogName: blog.name
        }
        return postRepository.updatePost(id, updatedPost)
    },

    async deletePost(id: string): Promise<boolean> {
        return await postRepository.deletePost(id);
    },

    async deleteAllPosts(): Promise<void> {
        await postRepository.deleteAllPosts()
    }
}
