import mongoose from "mongoose";
import {EmailConfirmation} from "../types/EmailConfirmation";

const emailConfirmationSchema = new mongoose.Schema<EmailConfirmation>({
    _id: String,
    userId: String,
    confirmationCode: String,
    expirationDate: Number,
    sendingTime: Number,
    isConfirmed: Boolean,
})

export const EmailConfirmationModel = mongoose.model('emailConfirmation', emailConfirmationSchema)
