import mongoose from "mongoose";
import {CommentatorInfo, CommentType} from "../types/CommentType";

const commentInfoSchema = new mongoose.Schema<CommentatorInfo>({
    userId: {type: String, required: true},
    userLogin: {type: String, required: true, min: 3, max: 10}
});

const commentSchema = new mongoose.Schema<CommentType>({
    _id: {type: String, required: true},
    content: {type: String, required: true, min: 20, max: 300},
    commentatorInfo: {type: commentInfoSchema},
    postId: String,
    createdAt: {type: String, default: new Date().toISOString()}
});

export const CommentModel = mongoose.model('comments', commentSchema)
