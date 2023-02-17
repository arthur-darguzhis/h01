import {ObjectId} from "mongodb";

export class UserActiveSession {
    public _id: string

    constructor(
        public issuedAt: number,
        public expireAt: number,
        public deviceId: string,
        public ip: string,
        public deviceName: string,
        public userId: string
    ) {
        this._id = new ObjectId().toString()
    }
}
