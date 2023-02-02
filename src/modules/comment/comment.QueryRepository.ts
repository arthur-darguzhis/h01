import {commentsCollection} from "../../db";
import {CommentViewModel} from "../../queryRepository/types/Comment/CommentViewModel";
import {PostCommentFilterType} from "../../queryRepository/types/PostComment/PostCommentFilterType";
import {mapCommentToViewModel} from "./comment.mapper";
import {PaginatorResponse} from "../../routes/types/paginator/PaginatorResponse";
import {PaginatorParams} from "../../routes/types/paginator/PaginatorParams";

export const commentQueryRepository = {
    async findComment(commentId: string): Promise<CommentViewModel | null> {
        const comment = await commentsCollection.findOne({_id: commentId})
        return comment ? mapCommentToViewModel(comment) : null
    },

    async findCommentsByPostId(postId: string, paginatorParams: PaginatorParams): Promise<PaginatorResponse<CommentViewModel>> {
        const {sortBy, sortDirection} = paginatorParams
        const pageNumber = +paginatorParams.pageNumber
        const pageSize = +paginatorParams.pageSize

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
            "items": comments.map(mapCommentToViewModel)
        }
    }
}
