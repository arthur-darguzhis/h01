import {BlogViewModel} from "../../queryRepository/types/Blog/BlogViewModel";
import {blogsCollection} from "../../db";
import {BlogFilterType} from "../../queryRepository/types/Blog/BlogFilterType";
import {mapBlogToViewModel} from "./blog.mapper";
import {PaginatorResponse} from "../../routes/types/paginator/PaginatorResponse";
import {BlogPaginatorParams} from "../../routes/types/paginator/BlogPaginatorParams";

export const blogQueryRepository = {

    async findBlogs(blogPaginatorParams: BlogPaginatorParams): Promise<PaginatorResponse<BlogViewModel>> {
        const {searchNameTerm, sortBy, sortDirection} = blogPaginatorParams
        const pageSize = +blogPaginatorParams.pageSize
        const pageNumber = +blogPaginatorParams.pageNumber

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
            "items": blogs.map(mapBlogToViewModel)
        }
    },

    async findBlog(id: string): Promise<BlogViewModel | null> {
        const blog = await blogsCollection.findOne({_id: id});
        return blog ? mapBlogToViewModel(blog) : null;
    },
}
