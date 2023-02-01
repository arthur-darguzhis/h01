import {BlogType} from "../../domain/types/BlogType";
import {BlogViewModel} from "../../queryRepository/types/Blog/BlogViewModel";

export const mapBlogToViewModel = (blog: BlogType): BlogViewModel => {
    return {
        id: blog._id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
    }
}
