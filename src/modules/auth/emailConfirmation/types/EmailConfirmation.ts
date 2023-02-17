import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";
import add from "date-fns/add";

export class EmailConfirmation {
    public _id: string
    public confirmationCode: string
    public expirationDate: number
    public sendingTime: number
    public isConfirmed: boolean

    constructor(
        public userId: string
    ) {
        this._id = new ObjectId().toString()
        this.confirmationCode = uuidv4()
        this.expirationDate = add(new Date(), {hours: 10, minutes: 3}).getTime()
        this.sendingTime = new Date().getTime()
        this.isConfirmed = false
    }
}
