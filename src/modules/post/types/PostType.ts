import {ObjectId} from "mongodb";

export class Post {
    public _id: string
    public createdAt: string

    constructor(
        public title: string,
        public shortDescription: string,
        public content: string,
        public blogId: string,
        public blogName: string,
    ) {
        this._id = new ObjectId().toString()
        this.createdAt = new Date().toISOString()
    }
}
