import {BlogViewModel} from "../types/BlogViewModel";
import {BlogFilterType} from "../types/BlogFilterType";
import {mapBlogToViewModel} from "../blog.mapper";
import {PaginatorResponse} from "../../auth/types/paginator/PaginatorResponse";
import {BlogPaginatorParams} from "../types/BlogPaginatorParams";
import {QueryMongoDbRepository} from "../../../common/repositories/QueryMongoDbRepository";
import {BlogType} from "../types/BlogType";
import {BlogModel} from "../model/BlogModel";

class BlogQueryRepository extends QueryMongoDbRepository<BlogType, BlogViewModel> {

    async findBlogs(blogPaginatorParams: BlogPaginatorParams): Promise<PaginatorResponse<BlogViewModel>> {
        const {searchNameTerm, sortBy, sortDirection} = blogPaginatorParams
        const pageSize = +blogPaginatorParams.pageSize
        const pageNumber = +blogPaginatorParams.pageNumber

        const filter: BlogFilterType = {};
        if (searchNameTerm) {
            filter.name = {'$regex': searchNameTerm, '$options': 'i'};
        }

        const direction = sortDirection === 'asc' ? 1 : -1;

        const count = await this.model.countDocuments(filter);
        const howManySkip = (pageNumber - 1) * pageSize;
        const blogs = await this.model.find(filter).sort({[sortBy]: direction}).skip(howManySkip).limit(pageSize).lean()

        return {
            "pagesCount": Math.ceil(count / pageSize),
            "page": pageNumber,
            "pageSize": pageSize,
            "totalCount": count,
            "items": blogs.map(mapBlogToViewModel)
        }
    }
}

export const blogQueryRepository = new BlogQueryRepository(BlogModel, mapBlogToViewModel, 'Blog')
