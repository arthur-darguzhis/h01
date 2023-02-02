import {postRepository} from '../../modules/post/post.MongoDbRepository'
import {blogRepository} from '../../modules/blog/blog.MongoDbRepository'
import {PostInputModel} from "../../routes/inputModels/PostInputModel";
import {BlogPostInputModel} from "../../routes/inputModels/BlogPostInputModel";
import {ObjectId} from "mongodb";
import {PostType} from "../types/PostType";

export const postsService = {
    async createPost(postInputModel: PostInputModel): Promise<PostType | never> {
        const blog = await blogRepository.findBlog(postInputModel.blogId);
        if (!blog) {
            throw new Error(`Blog with ID: ${postInputModel.blogId} is not exists`);
        }

        const newPost = {
            _id: new ObjectId().toString(),
            title: postInputModel.title,
            shortDescription: postInputModel.shortDescription,
            content: postInputModel.content,
            blogId: postInputModel.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString()
        }

        return await postRepository.addPost(newPost);
    },

    async createPostInBlog(blogId: string, body: BlogPostInputModel): Promise<PostType | never> {
        const blog = await blogRepository.findBlog(blogId);
        if (!blog) {
            throw new Error(`Blog with ID: ${blogId} is not exists`);
        }

        const newPost = {
            _id: new ObjectId().toString(),
            title: body.title,
            shortDescription: body.shortDescription,
            content: body.content,
            blogId: blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString()
        }

        return await postRepository.addPost(newPost)
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
    },
}
