import {BlogInputModel} from "../types/BlogInputModel";
import {BlogType} from "../types/BlogType";
import {CommandMongoDbRepository} from "../../../common/repositories/CommandMongoDbRepository";
import {BlogModel} from "../model/BlogModel";

export class BlogRepository extends CommandMongoDbRepository<BlogType, BlogInputModel> {

}

export const blogRepository = new BlogRepository(BlogModel, 'Blog')
//asdf
