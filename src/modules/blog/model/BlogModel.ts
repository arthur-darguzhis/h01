import mongoose from "mongoose";
import {BlogType} from "../types/BlogType";

const blogSchema = new mongoose.Schema<BlogType>({
    _id: {type: String, required: true},
    name: {type: String, required: true, min: 1, max: 15},
    description: {type: String, required: true, min: 1, max: 500},
    websiteUrl: {
        type: String,
        required: true,
        min: 13,
        max: 100,
        match: /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/
    },
    createdAt: {type: String, default: new Date().toISOString()}
});

export const BlogModel = mongoose.model('blogs', blogSchema)
