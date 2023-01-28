import nodemailer from "nodemailer";
import {settings} from "../settings";
import {MailIsNotSent} from "../domain/exceptions/MailIsNotSent";
import {EmailFormType} from "../managers/types/EmailFormType";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: settings.GMAIL_APP_LOGIN,
        pass: settings.GMAIL_APP_PASSWORD,
    },
});

export const emailAdapter = {
    async sendMail(preparedMail: EmailFormType): Promise<true | never> {

        await transporter.sendMail(preparedMail, function (error, info) {
            if (error) throw new MailIsNotSent(`Email with subject: ${preparedMail.subject} is not sent to ${preparedMail.to}`)
        });
        return true;
    }
}
