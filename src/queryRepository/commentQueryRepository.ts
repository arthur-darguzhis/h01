import {CommentType} from "../domain/types/CommentType";
import {commentsCollection} from "../db";
import {CommentViewModel} from "./types/Comment/CommentViewModel";
import {PostCommentFilterType} from "./types/PostComment/PostCommentFilterType";
import {CommentPaginatorType} from "./types/Comment/CommentPaginatorType";

// const _mapCommentToViewModel = (comment: CommentType): CommentViewModel => {
//     return {
//         id: comment._id,
//         content: comment.content,
//         commentatorInfo: {
//             userId: comment.commentatorInfo.userId,
//             userLogin: comment.commentatorInfo.userLogin
//         },
//         createdAt: comment.createdAt
//     }
// }

const _mapCommentToViewModelOldFormat = (comment: CommentType) => {
    return {
        id: comment._id,
        content: comment.content,
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
        createdAt: comment.createdAt
    }
}

export const commentQueryRepository = {
    async findComment(commentId: string): Promise<CommentViewModel | null> {
        const comment = await commentsCollection.findOne({_id: commentId})
        return comment ? _mapCommentToViewModelOldFormat(comment) : null
    },

    async findCommentsByPostId(
        postId: string,
        sortBy: string,
        sortDirection: string,
        pageNumber: number,
        pageSize: number): Promise<CommentPaginatorType> {

        const direction = sortDirection === 'asc' ? 1 : -1;

        let filter: PostCommentFilterType = {postId: postId}
        let count = await commentsCollection.countDocuments(filter);
        const howManySkip = (pageNumber - 1) * pageSize;
        const comments = await commentsCollection.find(filter).sort(sortBy, direction).skip(howManySkip).limit(pageSize).toArray()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            // "items": comments.map(_mapCommentToViewModel)
            "items": comments.map(_mapCommentToViewModelOldFormat)
        }
    }
}
