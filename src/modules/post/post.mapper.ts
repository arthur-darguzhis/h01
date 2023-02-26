import {Post, PostNewestLikes} from "./types/PostType";
import {PostViewModel} from "./types/PostViewModel";
import {LikeOfPost} from "./types/LikeOfPost";

const mapPostNewestLikes = (newestLike: PostNewestLikes): PostNewestLikes => {
    return {
        addedAt: newestLike.addedAt,
        userId: newestLike.userId,
        login: newestLike.login,
    }
}

export const mapPostToViewModel = (post: Post, myStatus: string = LikeOfPost.LIKE_STATUS_OPTIONS.NONE): PostViewModel => {
    return {
        id: post._id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt,
        extendedLikesInfo: {
            likesCount: post.extendedLikesInfo.likesCount,
            dislikesCount: post.extendedLikesInfo.dislikesCount,
            newestLikes: post.extendedLikesInfo.newestLikes.map(mapPostNewestLikes),
            myStatus: myStatus
        }
    }
}
