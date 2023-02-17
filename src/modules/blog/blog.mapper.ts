import {Blog} from "./types/BlogType";
import {BlogViewModel} from "./types/BlogViewModel";

export const mapBlogToViewModel = (blog: Blog): BlogViewModel => {
    return {
        id: blog._id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
    }
}
