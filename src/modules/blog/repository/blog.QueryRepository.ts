import {BlogViewModel} from "../types/BlogViewModel";
import {mapBlogToViewModel} from "../blog.mapper";
import {PaginatorResponse} from "../../auth/types/paginator/PaginatorResponse";
import {BlogPaginatorParams} from "../types/BlogPaginatorParams";
import {BlogModel} from "../model/BlogModel";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";

export class BlogQueryRepository {
    async find(id: string): Promise<BlogViewModel | null> {
        const blog = await BlogModel.findOne({_id: id});
        return blog ? mapBlogToViewModel(blog) : null
    }

    async get(id: string): Promise<BlogViewModel | never> {
        const blog = await BlogModel.findOne({_id: id});
        if (!blog) throw new EntityNotFound(`Blog with ID: ${id} is not exists`)
        return mapBlogToViewModel(blog)
    }

    async findBlogs(blogPaginatorParams: BlogPaginatorParams): Promise<PaginatorResponse<BlogViewModel>> {
        const {searchNameTerm, sortBy, sortDirection} = blogPaginatorParams
        const pageSize = +blogPaginatorParams.pageSize
        const pageNumber = +blogPaginatorParams.pageNumber

        const filter: { name?: { '$regex': string, '$options': 'i' } } = {};
        if (searchNameTerm) {
            filter.name = {'$regex': searchNameTerm, '$options': 'i'};
        }

        const direction = sortDirection === 'asc' ? 1 : -1;

        const count = await BlogModel.countDocuments(filter);
        const howManySkip = (pageNumber - 1) * pageSize;
        const blogs = await BlogModel.find(filter).sort({[sortBy]: direction}).skip(howManySkip).limit(pageSize).lean()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            "items": blogs.map(mapBlogToViewModel)
        }
    }
}

export const blogQueryRepository = new BlogQueryRepository()
