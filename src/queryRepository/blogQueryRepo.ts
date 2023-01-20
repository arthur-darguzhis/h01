import {BlogViewModel} from "./types/BlogViewModel";
import {BlogType} from "../domain/types/BlogType";

// const blogQueryRepo = {
//     getBlogs(): BlogViewModel {
//         return [];
//     }
//
//     _mapDbBlogToBlogViewModel
// }


export const convertBlogToViewModel = (blog: BlogType): BlogViewModel => {
    return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
    }
}
