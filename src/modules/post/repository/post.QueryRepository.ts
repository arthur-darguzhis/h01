import {PostViewModel} from "../types/PostViewModel";
import {mapPostToViewModel} from "../post.mapper";
import {PaginatorResponse} from "../../auth/types/paginator/PaginatorResponse";
import {PaginatorParams} from "../../auth/types/paginator/PaginatorParams";
import {BlogRepository} from "../../blog/repository/blog.MongoDbRepository";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";
import {PostModel} from "../model/PostModel";
import {injectable} from "inversify";
import {LikeOfComment} from "../../comment/types/LikeOfCommentType";
import {LikesOfPostsRepository} from "./likesOfPostsRepository";

@injectable()
export class PostQueryRepository {
    constructor(
        protected blogRepository: BlogRepository,
        protected likesOfPostsRepository: LikesOfPostsRepository
    ) {
    }

    async find(id: string): Promise<PostViewModel | null> {
        const post = await PostModel.findOne({_id: id});
        return post ? mapPostToViewModel(post) : null
    }

    async get(id: string, userId = null): Promise<PostViewModel | never> {
        const post = await PostModel.findOne({_id: id}).lean();
        if (!post) throw new EntityNotFound(`Post with ID: ${id} is not exists`)

        let myStatus = LikeOfComment.LIKE_STATUS_OPTIONS.NONE
        if (userId) {
            const myReaction = await this.likesOfPostsRepository.findUserReactionOnThePost(post._id, userId)
            if (myReaction) {
                myStatus = myReaction.status
            }
        }

        return mapPostToViewModel(post, myStatus)
    }

    async findPosts(paginatorParams: PaginatorParams): Promise<PaginatorResponse<PostViewModel>> {
        const {sortBy, sortDirection} = paginatorParams
        const pageNumber = +paginatorParams.pageNumber
        const pageSize = +paginatorParams.pageSize

        const direction = sortDirection === 'asc' ? 1 : -1;
        const count = await PostModel.countDocuments({});
        const howManySkip = (pageNumber - 1) * pageSize;
        const blogs = await PostModel.find({}).sort({[sortBy]: direction}).skip(howManySkip).limit(pageSize).lean()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            // @ts-ignore
            "items": blogs.map(mapPostToViewModel)
        }
    }

    async findPostsByBlogId(
        blogId: string,
        paginatorParams: PaginatorParams): Promise<PaginatorResponse<PostViewModel>> {
        const {sortBy, sortDirection} = paginatorParams;
        const pageNumber = +paginatorParams.pageNumber
        const pageSize = +paginatorParams.pageSize

        if (!await this.blogRepository.isExists(blogId)) {
            throw new EntityNotFound(`Blog with ID: ${blogId} is not exists`)
        }

        const direction = sortDirection === 'asc' ? 1 : -1;

        let filter = {blogId: blogId}
        let count = await PostModel.countDocuments(filter);
        const howManySkip = (pageNumber - 1) * pageSize;
        const blogs = await PostModel.find(filter).sort({[sortBy]: direction}).skip(howManySkip).limit(pageSize).lean()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            // @ts-ignore
            "items": blogs.map(mapPostToViewModel)
        }
    }
}
