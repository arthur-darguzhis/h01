import nodemailer from "nodemailer";
import {settings} from "../settings";
import {EmailFormType} from "../managers/types/EmailFormType";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: settings.GMAIL_APP_LOGIN,
        pass: settings.GMAIL_APP_PASSWORD,
    },
});

export const emailAdapter = {
    sendMail(preparedMail: EmailFormType) {
        transporter.sendMail(preparedMail);
    }
}
