import {postsCollection} from "../db";
import {PostInputModel} from "../model/post/PostInputModel";
import {PostType} from "../types/PostType";

export const postRepository = {
    async createPost(newPost: PostType): Promise<PostType> {
        await postsCollection.insertOne(newPost)
        return newPost;
    },

    async findPosts(): Promise<PostType[]> {
        return postsCollection.find({}).toArray();
    },

    async findPost(id: string): Promise<PostType | null> {
        return await postsCollection.findOne({id: id});
    },

    async updatePost(id: string, post: PostInputModel): Promise<boolean> {
        const result = await postsCollection.updateOne({id: id}, {$set: post})
        return result.matchedCount === 1;
    },

    async deletePost(id: string): Promise<boolean> {
        const result = await postsCollection.deleteOne({id: id});
        return result.deletedCount === 1;
    },

    async deleteAllPosts(): Promise<void> {
        await postsCollection.deleteMany({})
    }
}
