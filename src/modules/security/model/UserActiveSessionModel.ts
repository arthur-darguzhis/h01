import mongoose from "mongoose";
import {UserActiveSessionType} from "../types/UserActiveSessionType";

const userActiveSessionSchema = new mongoose.Schema<UserActiveSessionType>({
    _id: {type: String, required: true},
    issuedAt: Number,
    expireAt: Number,
    deviceId: {type: String, required: true},
    IP: {type: String, required: true},
    deviceName: String,
    userId: {type: String, required: true}
})

export const UserActiveSessionModel = mongoose.model('usersActiveSessions', userActiveSessionSchema)
