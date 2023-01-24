import {postsCollection} from "../db";
import {PostInputModel} from "../routes/inputModels/PostInputModel";
import {PostType} from "../domain/types/PostType";
import {ObjectId} from "mongodb";

export const postRepository = {
    async addPost(newPost: PostType): Promise<PostType> {
        await postsCollection.insertOne(newPost)
        return newPost;
    },

    async findPost(id: string): Promise<PostType | null> {
        return await postsCollection.findOne({_id: new ObjectId(id).toString()});
    },

    async updatePost(id: string, post: PostInputModel): Promise<boolean> {
        const result = await postsCollection.updateOne({_id: new ObjectId(id).toString()}, {$set: post})
        return result.matchedCount === 1;
    },

    async deletePost(id: string): Promise<boolean> {
        const result = await postsCollection.deleteOne({_id: new ObjectId(id).toString()});
        return result.deletedCount === 1;
    },

    async deleteBlogPosts(blogId: string): Promise<void> {
        await postsCollection.deleteMany({blogId: blogId});
    },

    async deleteAllPosts(): Promise<void> {
        await postsCollection.deleteMany({})
    },

}
