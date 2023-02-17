import nodemailer from "nodemailer";
import {settings} from "../../settings";
import {EmailDto} from "../managers/email/types/EmailDto";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: settings.GMAIL_APP_LOGIN,
        pass: settings.GMAIL_APP_PASSWORD,
    },
});

export const emailAdapter = {
    sendMail(preparedMail: EmailDto) {
        transporter.sendMail(preparedMail);
    }
}
