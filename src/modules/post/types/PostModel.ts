import mongoose from "mongoose";
import {PostType} from "./PostType";

const postSchema = new mongoose.Schema<PostType>({
    _id: {type: String, required: true},
    title: {type: String, required: true, min: 1, max: 30},
    shortDescription: {type: String, required: true, min: 1, max: 100},
    content: {type: String, required: true, min: 1, max: 1000},
    blogId: {type: String, required: true},
    blogName: {type: String, required: true, min: 1, max: 15},
    createdAt: {type: String, default: new Date().toISOString()}
})

export const PostModel = mongoose.model('posts', postSchema)
