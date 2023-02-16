import mongoose from "mongoose";
import {LikeOfCommentType} from "../types/LikeOfCommentType";

const likeOfCommentSchema = new mongoose.Schema<LikeOfCommentType>({
    _id: {type: String, required: true},
    userId: {type: String, required: true},
    commentId: {type: String, required: true},
    status: {type: String},
    createdAt: {
        type: String, default: new Date().toISOString()
    },
});

export const LikeOfCommentModel = mongoose.model('likes_of_comments', likeOfCommentSchema)
