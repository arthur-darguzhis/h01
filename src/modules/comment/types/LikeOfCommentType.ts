import {ObjectId} from "mongodb";
import {UnprocessableEntity} from "../../../common/exceptions/UnprocessableEntity";

export class LikeOfComment {
    public static readonly LIKE_STATUS_OPTIONS = {
        NONE: "None",
        LIKE: "Like",
        DISLIKE: "Dislike"
    }

    public _id: string
    public createdAt: string

    constructor(
        public userId: string,
        public commentId: string,
        public status: string
    ) {
        this._id = new ObjectId().toString()
        this.createdAt = new Date().toISOString()
        if (!Object.values(LikeOfComment.LIKE_STATUS_OPTIONS).includes(status)) {
            throw new UnprocessableEntity('Unknown user reaction on comment');
        }
        this.status = status
    }
}
