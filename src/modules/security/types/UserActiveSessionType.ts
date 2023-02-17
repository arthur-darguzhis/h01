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

// export type UserActiveSessionType = {
//     _id: string
//     issuedAt: number
//     expireAt: number
//     deviceId: string
//     ip: string
//     deviceName: string
//     userId: string
// }
