import {dbConnection} from "../../db";
import {PostInputModel} from "./types/PostInputModel";
import {PostType} from "./types/PostType";
import {CommandMongoDbRepository} from "../../common/repositories/CommandMongoDbRepository";

class PostRepository extends CommandMongoDbRepository<PostType, PostInputModel>{
    async deletePostsRelatedBlogIs(blogId: string): Promise<void> {
        await this.collection.deleteMany({blogId: blogId});
    }
}

export const postRepository = new PostRepository(dbConnection, 'posts');
