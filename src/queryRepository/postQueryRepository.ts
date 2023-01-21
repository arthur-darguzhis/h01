import {PostViewModel} from "./types/PostViewModel";
import {PostType} from "../domain/types/PostType";
import {postsCollection} from "../db";

export const convertPostToViewModel = (post: PostType): PostViewModel => {
    return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt
    }
}

export const postQueryRepository = {

    async findPosts(): Promise<PostType[]> {
        return postsCollection.find({}).toArray();
    },

    async findPost(id: string): Promise<PostType | null> {
        return await postsCollection.findOne({id: id});
    },
}
