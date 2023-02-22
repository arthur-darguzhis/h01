import {PostRepository} from './repository/post.MongoDbRepository'
import {BlogRepository} from '../blog/repository/blog.MongoDbRepository'
import {PostInputModel} from "./types/PostInputModel";
import {BlogPostInputModel} from "../blog/types/BlogPostInputModel";
import {ObjectId} from "mongodb";
import {Post} from "./types/PostType";
import {injectable} from "inversify";

@injectable()
export class PostsService {

    constructor(
        protected postRepository: PostRepository,
        protected blogRepository: BlogRepository
    ) {
    }

    async createPost(postInputModel: PostInputModel): Promise<Post> {
        const blog = await this.blogRepository.get(postInputModel.blogId);

        const newPost = {
            _id: new ObjectId().toString(),
            title: postInputModel.title,
            shortDescription: postInputModel.shortDescription,
            content: postInputModel.content,
            blogId: postInputModel.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString()
        }

        return await this.postRepository.add(newPost);
    }

    async createPostInBlog(blogId: string, body: BlogPostInputModel): Promise<Post | never> {
        const blog = await this.blogRepository.get(blogId);

        const newPost = {
            _id: new ObjectId().toString(),
            title: body.title,
            shortDescription: body.shortDescription,
            content: body.content,
            blogId: blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString()
        }

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
}
