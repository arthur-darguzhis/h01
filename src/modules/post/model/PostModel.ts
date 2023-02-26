import mongoose from "mongoose";
import {Post} from "../types/PostType";

const postNewestLikes = new mongoose.Schema({
    addedAt: {type: String},
    userId: {type: String},
    login: {type: String}
})

const postExtendedLikesInfoViewModel = new mongoose.Schema({
    likesCount: {type: Number, default: 0},
    dislikesCount: {type: Number, default: 0},
    newestLikes: {type: [postNewestLikes]}
})

const postSchema = new mongoose.Schema<Post>({
    _id: {type: String, required: true},
    title: {type: String, required: true, min: 1, max: 30},
    shortDescription: {type: String, required: true, min: 1, max: 100},
    content: {type: String, required: true, min: 1, max: 1000},
    blogId: {type: String, required: true},
    blogName: {type: String, required: true, min: 1, max: 15},
    extendedLikesInfo: {type: postExtendedLikesInfoViewModel},
    createdAt: {type: String, default: new Date().toISOString()}
})

export const PostModel = mongoose.model('posts', postSchema)
