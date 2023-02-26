import mongoose from "mongoose";
import {LikeOfPost} from "../types/LikeOfPost";

const likeOfPostSchema = new mongoose.Schema<LikeOfPost>({
    _id: {type: String, required: true},
    userId: {type: String, required: true},
    login: {type: String, required: true},
    postId: {type: String, required: true},
    status: {type: String},
    addedAt: {
        type: String, default: new Date().toISOString()
    },
})

export const LikeOfPostModel = mongoose.model('likes_of_posts', likeOfPostSchema)
