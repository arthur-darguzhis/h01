import nodemailer from "nodemailer";
import {settings} from "../settings";
import {EmailFormType} from "../managers/types/EmailFormType";
import {MailIsNotSent} from "../domain/exceptions/MailIsNotSent";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: settings.GMAIL_APP_LOGIN,
        pass: settings.GMAIL_APP_PASSWORD,
    },
});

export const emailAdapter = {
    async sendMail(preparedMail: EmailFormType): Promise<true | never> {
        try{
            await transporter.sendMail(preparedMail);
        } catch (e) {
            throw new MailIsNotSent('Mail is not sent');
        }
        return true;
    }
}
