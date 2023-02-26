import {ObjectId} from "mongodb";
import {UnprocessableEntity} from "../../../common/exceptions/UnprocessableEntity";

export class LikeOfPost {
    public static readonly LIKE_STATUS_OPTIONS = {
        NONE: "None",
        LIKE: "Like",
        DISLIKE: "Dislike"
    }

    public _id: string
    public addedAt: string

    constructor(
        public userId: string,
        public login: string,
        public postId: string,
        public status: string,
    ) {
        this._id = new ObjectId().toString()
        this.addedAt = new Date().toISOString()
        if (!Object.values(LikeOfPost.LIKE_STATUS_OPTIONS).includes(status)) {
            throw new UnprocessableEntity('Unknown status for user reaction on Post');
        }
        this.status = status
    }
}
