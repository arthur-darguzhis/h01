import {postRepository} from '../../repository/postMongoDbRepository'
import {blogRepository} from '../../repository/blogMongoDbRepository'
import {PostInputModel} from "../../routes/inputModels/PostInputModel";
import {BlogPostInputModel} from "../../routes/inputModels/BlogPostInputModel";

export const postsService = {
    async createPost(postInputModel: PostInputModel): Promise<string | never> {
        const blog = await blogRepository.findBlog(postInputModel.blogId);
        if (!blog) {
            throw new Error(`Blog with ID: ${postInputModel.blogId} is not exists`);
        }

        const newPost = {
            id: new Date().getTime().toString(),
            title: postInputModel.title,
            shortDescription: postInputModel.shortDescription,
            content: postInputModel.content,
            blogId: postInputModel.blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString()
        }

        const post = await postRepository.createPost(newPost)
        return post.id
    },

    async createPostInBlog(blogId: string, body: BlogPostInputModel): Promise<string | never> {
        const blog = await blogRepository.findBlog(blogId);
        if (!blog) {
            throw new Error(`Blog with ID: ${blogId} is not exists`);
        }

        const newPost = {
            id: new Date().getTime().toString(),
            title: body.title,
            shortDescription: body.shortDescription,
            content: body.content,
            blogId: blogId,
            blogName: blog.name,
            createdAt: new Date().toISOString()
        }

        const post = await postRepository.createPost(newPost)
        return post.id
    },

    async updatePost(id: string, postInputModel: PostInputModel): Promise<boolean | never> {
        const blog = await blogRepository.findBlog(postInputModel.blogId);
        if (!blog) {
            throw new Error(`Blog with ID: ${id} is not exists`)
        }

        const updatedPost: PostInputModel = {
            title: postInputModel.title,
            shortDescription: postInputModel.shortDescription,
            content: postInputModel.content,
            blogId: postInputModel.blogId,
            blogName: blog.name
        }
        return postRepository.updatePost(id, updatedPost)
    },

    async deletePost(id: string): Promise<boolean> {
        return await postRepository.deletePost(id);
    },

    async deleteAllPosts(): Promise<void> {
        await postRepository.deleteAllPosts()
    },
}
