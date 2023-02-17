import {ObjectId} from "mongodb";

export class Blog {
    public _id: string
    public createdAt: string

    constructor(
        public name: string,
        public description: string,
        public websiteUrl: string,
    ) {
        this._id = new ObjectId().toString()
        this.createdAt = new Date().toISOString()
    }
}
