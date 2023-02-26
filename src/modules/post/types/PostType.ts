import {ObjectId} from "mongodb";

export type PostNewestLikes = {
    addedAt: String,
    userId: String,
    login: String
}

export type PostExtendedLikesInfoViewModel = {
    likesCount: Number,
    dislikesCount: Number,
    newestLikes: Array<PostNewestLikes>
}

export class Post {
    public _id: string
    public createdAt: string
    public extendedLikesInfo: PostExtendedLikesInfoViewModel

    constructor(
        public title: string,
        public shortDescription: string,
        public content: string,
        public blogId: string,
        public blogName: string,
    ) {
        this._id = new ObjectId().toString()
        this.createdAt = new Date().toISOString()
        this.extendedLikesInfo = {
            likesCount: 0,
            dislikesCount: 0,
            newestLikes: []
        };
    }
}
