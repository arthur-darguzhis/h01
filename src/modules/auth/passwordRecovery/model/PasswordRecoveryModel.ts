import mongoose from "mongoose";
import {PasswordRecoveryType} from "../types/PasswordRecoveryType";

const passwordRecoverySchema = new mongoose.Schema<PasswordRecoveryType>({
    _id: String,
    userId: String,
    code: String,
    expirationDate: Number,
    sendingTime: Number,
    isConfirmed: Boolean,
});

export const PasswordRecoveryModel = mongoose.model('passwordRecoveryCodes', passwordRecoverySchema)
