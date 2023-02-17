import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";
import add from "date-fns/add";

export class PasswordRecovery {
    public _id: string
    public code: string
    public expirationDate: number
    public sendingTime: number
    public isConfirmed: boolean

    constructor(
        public userId: string,
    ) {
        this._id = new ObjectId().toString()
        this.code = uuidv4()
        this.expirationDate = add(new Date(), {hours: 24}).getTime()
        this.sendingTime = new Date().getTime()
        this.isConfirmed = false
    }
}

