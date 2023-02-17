import {CommentViewModel} from "../types/CommentViewModel";
import {PostCommentFilterType} from "../types/PostCommentFilterType";
import {mapCommentToViewModel} from "../comment.mapper";
import {PaginatorResponse} from "../../auth/types/paginator/PaginatorResponse";
import {PaginatorParams} from "../../auth/types/paginator/PaginatorParams";
import {postQueryRepository} from "../../post/repository/post.QueryRepository";
import {CommentModel} from "../model/CommentModel";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";
import {likesOfCommentsRepository} from "./likesOfComments.MongoDbRepository";
import {LIKE_STATUSES} from "../types/LikeStatus";

class CommentQueryRepository {

    async find(id: string): Promise<CommentViewModel | null> {
        const comment = await CommentModel.findOne({_id: id});
        return comment ? mapCommentToViewModel(comment) : null
    }

    async get(id: string, userId = null): Promise<CommentViewModel | never> {
        const comment = await CommentModel.findOne({_id: id});
        if (!comment) throw new EntityNotFound(`Comment with ID: ${id} is not exists`)

        let myStatus = LIKE_STATUSES.NONE
        if (userId) {
            const myReaction = await likesOfCommentsRepository.findUserReactionOnTheComment(comment._id, userId)
            if (myReaction) {
                myStatus = myReaction.status
            }
        }
        return mapCommentToViewModel(comment, myStatus)
    }

    async findCommentsByPostId(postId: string, paginatorParams: PaginatorParams, userId = null): Promise<PaginatorResponse<CommentViewModel>> {
        const post = await postQueryRepository.get(postId);

        const {sortBy, sortDirection} = paginatorParams
        const pageNumber = +paginatorParams.pageNumber
        const pageSize = +paginatorParams.pageSize

        const direction = sortDirection === 'asc' ? 1 : -1;

        let filter: PostCommentFilterType = {postId: post.id}
        let count = await CommentModel.countDocuments(filter);
        const howManySkip = (pageNumber - 1) * pageSize;
        const comments = await CommentModel.find(filter).sort({[sortBy]: direction}).skip(howManySkip).limit(pageSize).lean()


        let items: CommentViewModel[];
        if (userId) {
            const commentsIdList: Array<string> = comments.map((comment) => comment._id);
            const myReactiondOnComments = await likesOfCommentsRepository.getUserReactionOnCommentsBunch(commentsIdList, userId)

            const commentIdAndReactionsList: any = []
            myReactiondOnComments.forEach((likeData) => {
                commentIdAndReactionsList[likeData.commentId] = likeData.status;
            })

            items = comments.map((comment) => {
                const likeStatus = commentIdAndReactionsList[comment._id] || LIKE_STATUSES.NONE;
                const viewModel = mapCommentToViewModel(comment, likeStatus)
                return viewModel;
            })
        } else {
            items = comments.map((comment) => {
                return mapCommentToViewModel(comment)
            })
        }

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            "items": items
        }
    }
}

export const commentQueryRepository = new CommentQueryRepository()
