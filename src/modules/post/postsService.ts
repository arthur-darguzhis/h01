import {PostRepository} from './repository/post.MongoDbRepository'
import {BlogRepository} from '../blog/repository/blog.MongoDbRepository'
import {PostInputModel} from "./types/PostInputModel";
import {BlogPostInputModel} from "../blog/types/BlogPostInputModel";
import {Post} from "./types/PostType";
import {injectable} from "inversify";
import {LikesOfPostsRepository} from "./repository/likesOfPostsRepository";
import {LikeOfPost} from "./types/LikeOfPost";

@injectable()
export class PostsService {

    constructor(
        protected postRepository: PostRepository,
        protected blogRepository: BlogRepository,
        protected likesOfPostsRepository: LikesOfPostsRepository
    ) {
    }

    async createPost(postInputModel: PostInputModel): Promise<Post> {
        const blog = await this.blogRepository.get(postInputModel.blogId);

        const newPost = new Post(
            postInputModel.title,
            postInputModel.shortDescription,
            postInputModel.content,
            postInputModel.blogId,
            blog.name)

        return await this.postRepository.add(newPost);
    }

    async createPostInBlog(blogId: string, body: BlogPostInputModel): Promise<Post | never> {
        const blog = await this.blogRepository.get(blogId);

        const newPost = new Post(
            body.title,
            body.shortDescription,
            body.content,
            blogId,
            blog.name)

        return await this.postRepository.add(newPost)
    }

    async updatePost(id: string, postInputModel: PostInputModel): Promise<boolean | never> {
        const post = await this.postRepository.get(id);
        const blog = await this.blogRepository.get(postInputModel.blogId);

        const updatedPost: PostInputModel = {
            title: postInputModel.title,
            shortDescription: postInputModel.shortDescription,
            content: postInputModel.content,
            blogId: postInputModel.blogId,
            blogName: blog.name
        }
        return this.postRepository.update(id, updatedPost)
    }

    async deletePost(id: string): Promise<boolean> {
        const post = await this.postRepository.get(id)
        return await this.postRepository.delete(post._id);
    }

    async processLikeStatus(userId: string, userLogin: string, postId: string, likeStatus: string): Promise<boolean | never> {
        const post = await this.postRepository.get(postId)
        const userReaction = await this.likesOfPostsRepository.findUserReactionOnThePost(postId, userId)

        if (!userReaction) {
            const newUserReactionOnPost = new LikeOfPost(
                userId,
                userLogin,
                postId,
                likeStatus,
            )
            await this.likesOfPostsRepository.add(newUserReactionOnPost)
        } else {
            const previousLikeStatus = userReaction.status
            if (previousLikeStatus === likeStatus) {
                return true;
            }
            await this.likesOfPostsRepository.updateLikeStatus(userReaction._id, likeStatus)
        }

        await this.updateLikesAndDislikesCountInPost(postId)
        return true;
    }

    async updateLikesAndDislikesCountInPost(postId: string) {
        const likesCount = await this.likesOfPostsRepository.calculateCountOfLikes(postId);
        const dislikesCount = await this.likesOfPostsRepository.calculateCountOfDislikes(postId);
        const newestLikes = await this.likesOfPostsRepository.getNewestLikesOnThePost(postId);
        await this.postRepository.updateLikesInfo(postId, likesCount, dislikesCount, newestLikes);
    }
}
