import {PostViewModel} from "../types/PostViewModel";
import {BlogPostFilterType} from "../types/BlogPostFilterType";
import {mapPostToViewModel} from "../post.mapper";
import {PaginatorResponse} from "../../auth/types/paginator/PaginatorResponse";
import {PaginatorParams} from "../../auth/types/paginator/PaginatorParams";
import {blogRepository} from "../../blog/repository/blog.MongoDbRepository";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";
import {QueryMongoDbRepository} from "../../../common/repositories/QueryMongoDbRepository";
import {Post} from "../types/PostType";
import {PostModel} from "../types/PostModel";

class PostQueryRepository extends QueryMongoDbRepository<Post, PostViewModel> {
    async findPosts(paginatorParams: PaginatorParams): Promise<PaginatorResponse<PostViewModel>> {
        const {sortBy, sortDirection} = paginatorParams
        const pageNumber = +paginatorParams.pageNumber
        const pageSize = +paginatorParams.pageSize

        const direction = sortDirection === 'asc' ? 1 : -1;
        const count = await this.model.countDocuments({});
        const howManySkip = (pageNumber - 1) * pageSize;
        const blogs = await this.model.find({}).sort({[sortBy]: direction}).skip(howManySkip).limit(pageSize).lean()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            "items": blogs.map(mapPostToViewModel)
        }
    }

    async findPostsByBlogId(
        blogId: string,
        paginatorParams: PaginatorParams): Promise<PaginatorResponse<PostViewModel>> {
        const {sortBy, sortDirection} = paginatorParams;
        const pageNumber = +paginatorParams.pageNumber
        const pageSize = +paginatorParams.pageSize

        if (!await blogRepository.isExists(blogId)) {
            throw new EntityNotFound(`Blog with ID: ${blogId} is not exists`)
        }

        const direction = sortDirection === 'asc' ? 1 : -1;

        let filter: BlogPostFilterType = {blogId: blogId}
        let count = await this.model.countDocuments(filter);
        const howManySkip = (pageNumber - 1) * pageSize;
        const blogs = await this.model.find(filter).sort({[sortBy]: direction}).skip(howManySkip).limit(pageSize).lean()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            "items": blogs.map(mapPostToViewModel)
        }
    }
}

export const postQueryRepository = new PostQueryRepository(PostModel, mapPostToViewModel, 'Post')
