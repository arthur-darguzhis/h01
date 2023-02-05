import {dbConnection} from "../../db";
import {CommentViewModel} from "./types/CommentViewModel";
import {PostCommentFilterType} from "./types/PostCommentFilterType";
import {mapCommentToViewModel} from "./comment.mapper";
import {PaginatorResponse} from "../auth/types/paginator/PaginatorResponse";
import {PaginatorParams} from "../auth/types/paginator/PaginatorParams";
import {postQueryRepository} from "../post/post.QueryRepository";
import {QueryMongoDbRepository} from "../../common/repositories/QueryMongoDbRepository";
import {CommentType} from "./types/CommentType";

class CommentQueryRepository extends QueryMongoDbRepository<CommentType, CommentViewModel>{
    async findCommentsByPostId(postId: string, paginatorParams: PaginatorParams): Promise<PaginatorResponse<CommentViewModel>> {
        const post = await postQueryRepository.get(postId);

        const {sortBy, sortDirection} = paginatorParams
        const pageNumber = +paginatorParams.pageNumber
        const pageSize = +paginatorParams.pageSize

        const direction = sortDirection === 'asc' ? 1 : -1;

        let filter: PostCommentFilterType = {postId: post.id}
        let count = await this.collection.countDocuments(filter);
        const howManySkip = (pageNumber - 1) * pageSize;
        const comments = await this.collection.find(filter).sort(sortBy, direction).skip(howManySkip).limit(pageSize).toArray()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            "items": comments.map(mapCommentToViewModel)
        }
    }
}

export const commentQueryRepository = new CommentQueryRepository(dbConnection, 'comments', mapCommentToViewModel)
