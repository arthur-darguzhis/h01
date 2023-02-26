import {PostNewestLikes} from "./PostType";

export type PostViewModel = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    extendedLikesInfo: {
        likesCount: Number,
        dislikesCount: Number,
        newestLikes: Array<PostNewestLikes>,
        myStatus: string
    }
    createdAt: string
}
