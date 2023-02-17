import mongoose from "mongoose";
import {UserActiveSession} from "../types/UserActiveSessionType";

const userActiveSessionSchema = new mongoose.Schema<UserActiveSession>({
    _id: {type: String, required: true},
    issuedAt: Number,
    expireAt: Number,
    deviceId: {type: String, required: true},
    ip: {type: String, required: true},
    deviceName: String,
    userId: {type: String, required: true}
})

export const UserActiveSessionModel = mongoose.model('users_active_sessions', userActiveSessionSchema)
