import {PostViewModel} from "./types/PostViewModel";
import {PostType} from "../domain/types/PostType";
import {postsCollection} from "../db";

// export const convertPostToViewModel = (post: PostType): PostViewModel => {
const _mapPostToViewModel = (post: PostType): PostViewModel => {
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

    async findPosts(): Promise<PostViewModel[]> {
        const posts = await postsCollection.find({}).toArray();
        return posts.map(_mapPostToViewModel);
    },

    async findPost(id: string): Promise<PostViewModel | null> {
        const post = await postsCollection.findOne({id: id});
        return post ? _mapPostToViewModel(post) : null
    },
}
