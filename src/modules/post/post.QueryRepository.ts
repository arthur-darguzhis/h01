import {PostViewModel} from "../../queryRepository/types/Post/PostViewModel";
import {postsCollection} from "../../db";
import {BlogPostFilterType} from "../../queryRepository/types/BlogPost/BlogPostFilterType";
import {mapPostToViewModel} from "./post.mapper";
import {PaginatorResponse} from "../../routes/types/paginator/PaginatorResponse";
import {PaginatorParams} from "../../routes/types/paginator/PaginatorParams";

export const postQueryRepository = {
    async findPosts(paginatorParams: PaginatorParams): Promise<PaginatorResponse<PostViewModel>> {
        const {sortBy, sortDirection} = paginatorParams
        const pageNumber = +paginatorParams.pageNumber
        const pageSize = +paginatorParams.pageSize

        const direction = sortDirection === 'asc' ? 1 : -1;
        const count = await postsCollection.countDocuments({});
        const howManySkip = (pageNumber - 1) * pageSize;
        const blogs = await postsCollection.find({}).sort(sortBy, direction).skip(howManySkip).limit(pageSize).toArray()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            "items": blogs.map(mapPostToViewModel)
        }
    },

    async findPost(postId: string): Promise<PostViewModel | null> {
        const post = await postsCollection.findOne({_id: postId});
        return post ? mapPostToViewModel(post) : null
    },

    async findPostsByBlogId(
        id: string,
        sortBy: string,
        sortDirection: string,
        pageNumber: number,
        pageSize: number): Promise<PaginatorResponse<PostViewModel>> {

        const direction = sortDirection === 'asc' ? 1 : -1;

        let filter: BlogPostFilterType = {blogId: id}
        let count = await postsCollection.countDocuments(filter);
        const howManySkip = (pageNumber - 1) * pageSize;
        const blogs = await postsCollection.find(filter).sort(sortBy, direction).skip(howManySkip).limit(pageSize).toArray()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            "items": blogs.map(mapPostToViewModel)
        }

    }
}
