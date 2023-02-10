import mongoose from "mongoose";
import {EmailConfirmationType} from "../types/EmailConfirmationType";

const emailConfirmationSchema = new mongoose.Schema<EmailConfirmationType>({
    _id: String,
    userId: String,
    confirmationCode: String,
    expirationDate: Number,
    sendingTime: Number,
    isConfirmed: Boolean,
})

export const EmailConfirmationModel = mongoose.model('emailConfirmation', emailConfirmationSchema)
