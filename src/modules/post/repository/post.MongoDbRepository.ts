import {PostInputModel} from "../types/PostInputModel";
import {Post} from "../types/PostType";
import {CommandMongoDbRepository} from "../../../common/repositories/CommandMongoDbRepository";
import {PostModel} from "../types/PostModel";

class PostRepository extends CommandMongoDbRepository<Post, PostInputModel> {
    async deletePostsRelatedBlogIs(blogId: string): Promise<void> {
        await this.model.deleteMany({blogId: blogId});
    }
}

export const postRepository = new PostRepository(PostModel, 'Post');
