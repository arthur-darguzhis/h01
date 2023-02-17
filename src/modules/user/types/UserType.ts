import {ObjectId} from "mongodb";

export class User {
    public _id: string
    public createdAt: string

    constructor(
        public login: string,
        public passwordHash: string,
        public email: string,
        public isActive: boolean
    ) {
        this._id = new ObjectId().toString()
        this.createdAt = new Date().toISOString()
    }
}

// export type UserType = {
//     _id: string
//     login: string,
//     password: string,
//     email: string,
//     createdAt: string
//     isActive: boolean
// }
