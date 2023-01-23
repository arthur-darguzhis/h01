import {PostViewModel} from "./types/PostViewModel";
import {PostType} from "../domain/types/PostType";
import {postsCollection} from "../db";
import {PostPaginatorType} from "./types/PostPaginatorType";

const _mapPostToViewModel = (post: PostType): PostViewModel => {
    return {
        id: post.id,
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt
    }
}

export const postQueryRepository = {

    async findPosts(
        sortBy: string,
        sortDirection: string,
        pageNumber: number,
        pageSize: number
    ): Promise<PostPaginatorType> {
        const direction = sortDirection === 'asc' ? 1 : -1;
        const count = await postsCollection.countDocuments({});
        const howManySkip = (pageNumber - 1) * pageSize;
        const blogs = await postsCollection.find({}).sort(sortBy, direction).skip(howManySkip).limit(pageSize).toArray()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            "items": blogs.map(_mapPostToViewModel)
        }
    },

    async findPost(id: string): Promise<PostViewModel | null> {
        const post = await postsCollection.findOne({id: id});
        return post ? _mapPostToViewModel(post) : null
    },

    async findPostsByBlogId(
        id: string,
        sortBy: string,
        sortDirection: string,
        pageNumber: number,
        pageSize: number): Promise<PostPaginatorType> {

        const direction = sortDirection === 'asc' ? 1 : -1;

        let count = await postsCollection.countDocuments({blogId: id});
        const howManySkip = (pageNumber - 1) * pageSize;
        const blogs = await postsCollection.find({blogId: id}).sort(sortBy, direction).skip(howManySkip).limit(pageSize).toArray()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            "items": blogs.map(_mapPostToViewModel)
        }

    }
}
