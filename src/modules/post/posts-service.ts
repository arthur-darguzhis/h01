import {postRepository} from './repository/post.MongoDbRepository'
import {blogRepository} from '../blog/repository/blog.MongoDbRepository'
import {PostInputModel} from "./types/PostInputModel";
import {BlogPostInputModel} from "../blog/types/BlogPostInputModel";
import {ObjectId} from "mongodb";
import {PostType} from "./types/PostType";

export const postsService = {
    async createPost(postInputModel: PostInputModel): Promise<PostType> {
        const blog = await blogRepository.get(postInputModel.blogId);

        const newPost = {
            _id: new ObjectId().toString(),
            title: postInputModel.title,
            shortDescription: postInputModel.shortDescription,
            content: postInputModel.content,
            blogId: postInputModel.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString()
        }

        return await postRepository.add(newPost);
    },

    async createPostInBlog(blogId: string, body: BlogPostInputModel): Promise<PostType | never> {
        const blog = await blogRepository.get(blogId);

        const newPost = {
            _id: new ObjectId().toString(),
            title: body.title,
            shortDescription: body.shortDescription,
            content: body.content,
            blogId: blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString()
        }

        return await postRepository.add(newPost)
    },

    async updatePost(id: string, postInputModel: PostInputModel): Promise<boolean | never> {
        const post = await postRepository.get(id);
        const blog = await blogRepository.get(postInputModel.blogId);

        const updatedPost: PostInputModel = {
            title: postInputModel.title,
            shortDescription: postInputModel.shortDescription,
            content: postInputModel.content,
            blogId: postInputModel.blogId,
            blogName: blog.name
        }
        return postRepository.update(id, updatedPost)
    },

    async deletePost(id: string): Promise<boolean> {
        const post = await postRepository.get(id)
        return await postRepository.delete(post._id);
    },
}
