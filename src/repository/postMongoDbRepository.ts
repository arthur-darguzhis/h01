import {client, db, postsCollection} from "../db";
import {PostInputModel} from "../model/post/PostInputModel";
import {PostType} from "../types/PostType";
import {blogRepository} from "./blogMongoDbRepository";

export const postRepository = {
    async createPost(postInputModel: PostInputModel): Promise<PostType | never> {
        const blog = await blogRepository.getBlogById(postInputModel.blogId);
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

        await postsCollection.insertOne(newPost)
        return newPost;
    },

    async getPosts(): Promise<PostType[]> {
        return postsCollection.find({}).toArray();
    },

    async getPostsById(id: string): Promise<PostType | null> {
        return await postsCollection.findOne({id: id});
    },

    async updatePostById(id: string, postInputModel: PostInputModel): Promise<boolean | never> {
        const blog = await blogRepository.getBlogById(postInputModel.blogId);
        if (!blog) {
            throw new Error(`Blog with ID: ${id} is not exists`)
        }

        const result = await postsCollection.updateOne({id: id}, {
            $set:
                {
                    id: id,
                    title: postInputModel.title,
                    shortDescription: postInputModel.shortDescription,
                    content: postInputModel.content,
                    blogId: postInputModel.blogId,
                    blogName: blog.name
                }
        })
        return result.matchedCount === 1;
    },

    async deletePostById(id: string): Promise<boolean> {
        const result = await postsCollection.deleteOne({id: id});
        return result.deletedCount === 1;
    },

    async deleteAllPosts(): Promise<void> {
        await postsCollection.drop()
    }
}
