import {BlogViewModel} from "../model/blog/BlogViewModel";

export type BlogType = {
    id: string
    name: string,
    description: string,
    websiteUrl: string
}

export const convertBlogToViewModel = (blog: BlogType): BlogViewModel => {
    return {
        id: blog.id,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl
    }
}
