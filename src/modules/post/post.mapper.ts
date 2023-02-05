import {PostType} from "./types/PostType";
import {PostViewModel} from "./types/PostViewModel";

export const mapPostToViewModel = (post: PostType): PostViewModel => {
    return {
        id: post._id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt
    }
}
