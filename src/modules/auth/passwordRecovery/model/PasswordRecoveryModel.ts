import mongoose from "mongoose";
import {PasswordRecovery} from "../types/PasswordRecoveryType";

const passwordRecoverySchema = new mongoose.Schema<PasswordRecovery>({
    _id: String,
    userId: String,
    code: String,
    expirationDate: Number,
    sendingTime: Number,
    isConfirmed: Boolean,
});

export const PasswordRecoveryModel = mongoose.model('passwordRecoveryCodes', passwordRecoverySchema)
