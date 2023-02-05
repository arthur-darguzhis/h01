import {PostViewModel} from "./types/PostViewModel";
import {dbConnection} from "../../db";
import {BlogPostFilterType} from "./types/BlogPostFilterType";
import {mapPostToViewModel} from "./post.mapper";
import {PaginatorResponse} from "../auth/types/paginator/PaginatorResponse";
import {PaginatorParams} from "../auth/types/paginator/PaginatorParams";
import {blogRepository} from "../blog/blog.MongoDbRepository";
import {EntityNotFound} from "../../common/exceptions/EntityNotFound";
import {QueryMongoDbRepository} from "../../common/repositories/QueryMongoDbRepository";
import {PostType} from "./types/PostType";

class PostQueryRepository extends QueryMongoDbRepository<PostType, PostViewModel>{
    async findPosts(paginatorParams: PaginatorParams): Promise<PaginatorResponse<PostViewModel>> {
        const {sortBy, sortDirection} = paginatorParams
        const pageNumber = +paginatorParams.pageNumber
        const pageSize = +paginatorParams.pageSize

        const direction = sortDirection === 'asc' ? 1 : -1;
        const count = await this.collection.countDocuments({});
        const howManySkip = (pageNumber - 1) * pageSize;
        const blogs = await this.collection.find({}).sort(sortBy, direction).skip(howManySkip).limit(pageSize).toArray()

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

        if(!await blogRepository.isExists(blogId)){
            throw new EntityNotFound(`Blog with ID: ${blogId} is not exists`)
        }

        const direction = sortDirection === 'asc' ? 1 : -1;

        let filter: BlogPostFilterType = {blogId: blogId}
        let count = await this.collection.countDocuments(filter);
        const howManySkip = (pageNumber - 1) * pageSize;
        const blogs = await this.collection.find(filter).sort(sortBy, direction).skip(howManySkip).limit(pageSize).toArray()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            "items": blogs.map(mapPostToViewModel)
        }
    }
}

export const postQueryRepository = new PostQueryRepository(dbConnection, 'posts', mapPostToViewModel)
