import {postsCollection} from "../db";
import {PostInputModel} from "../routes/inputModels/PostInputModel";
import {PostType} from "../domain/types/PostType";

export const postRepository = {
    async createPost(newPost: PostType): Promise<PostType> {
        await postsCollection.insertOne(newPost)
        return newPost;
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

    async deleteBlogPosts(blogId: string): Promise<void> {
        await postsCollection.deleteMany({blogId: blogId});
    },

    async deleteAllPosts(): Promise<void> {
        await postsCollection.deleteMany({})
    },

}
