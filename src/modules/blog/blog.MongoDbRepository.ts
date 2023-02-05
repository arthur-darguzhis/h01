import {dbConnection} from "../../db";
import {BlogInputModel} from "./types/BlogInputModel";
import {BlogType} from "./types/BlogType";
import {CommandMongoDbRepository} from "../../common/repositories/CommandMongoDbRepository";

export class BlogRepository extends CommandMongoDbRepository<BlogType, BlogInputModel>{

}

export const blogRepository = new BlogRepository(dbConnection, 'blogs')
