import mongoose from "mongoose";
import {CommentatorInfo, CommentLikeInfo, CommentType} from "../types/CommentType";

const commentInfoSchema = new mongoose.Schema<CommentatorInfo>({
    userId: {type: String, required: true},
    userLogin: {type: String, required: true, min: 3, max: 10}
});

const commentLikesInfoSchema = new mongoose.Schema<CommentLikeInfo>({
    likesCount: {type: Number, default: 0},
    dislikesCount: {type: Number, default: 0}
})

const commentSchema = new mongoose.Schema<CommentType>({
    _id: {type: String, required: true},
    content: {type: String, required: true, min: 20, max: 300},
    commentatorInfo: {type: commentInfoSchema},
    postId: String,
    createdAt: {
        type: String, default: new Date().toISOString()
    },
    likesInfo: {type: commentLikesInfoSchema}
});

export const CommentModel = mongoose.model('comments', commentSchema)
