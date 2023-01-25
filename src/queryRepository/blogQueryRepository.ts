import {BlogViewModel} from "./types/Blog/BlogViewModel";
import {BlogType} from "../domain/types/BlogType";
import {blogsCollection} from "../db";
import {BlogPaginatorType} from "./types/Blog/BlogPaginatorType";
import {BlogFilterType} from "./types/Blog/BlogFilterType";

const _mapBlogToViewModel = (blog: BlogType): BlogViewModel => {
    //Делаем ручной маппинг почему?)
    return {
        id: blog._id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
    }
}

export const blogQueryRepository = {

    async findBlogs(
        searchNameTerm: string | null,
        sortBy: string,
        sortDirection: string,
        pageNumber: number,
        pageSize: number
    ): Promise<BlogPaginatorType> {

        const filter: BlogFilterType = {};
        if (searchNameTerm) {
            filter.name = {'$regex': searchNameTerm, '$options': 'i'};
        }

        const direction = sortDirection === 'asc' ? 1 : -1;

        const count = await blogsCollection.countDocuments(filter);
        const howManySkip = (pageNumber - 1) * pageSize;
        const blogs = await blogsCollection.find(filter).sort(sortBy, direction).skip(howManySkip).limit(pageSize).toArray()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            "items": blogs.map(_mapBlogToViewModel)
        }
    },

    async findBlog(id: string): Promise<BlogViewModel | null> {
        const blog = await blogsCollection.findOne({_id: id});
        return blog ? _mapBlogToViewModel(blog) : null;
    },
}
