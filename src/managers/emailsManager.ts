import {settings} from "../settings";
import {UserType} from "../domain/types/UserType";
import {MailIsNotSent} from "../domain/exceptions/MailIsNotSent";
import {emailAdapter} from "../adapters/emailAdapter";
import {EmailConfirmationType} from "../modules/emailConfirmation/types/EmailConfirmationType";

export const emailsManager = {
    async sendRegistrationConfirmationLetter(user: UserType, emailConfirmation: EmailConfirmationType): Promise<true | never> {
        if (!emailConfirmation.confirmationCode || !user.email) {
            throw new MailIsNotSent('something wrong with confirmationCode or user email is empty');
        }

        const confirmUrl = settings.APP_HOST + 'confirm-registration?code=' + emailConfirmation.confirmationCode;

        const preparedMail = {
            from: `"Artur Darguzhis" <${settings.GMAIL_APP_LOGIN}>`,
            to: user.email,
            subject: 'Thank for your registration',
            html: `<h1>Thank for your registration</h1>
                   <p>To finish registration please follow the link below:
                      <a href='${confirmUrl}'>complete registration</a>
                   </p>`
        };

        await emailAdapter.sendMail(preparedMail)
        return true;
    }
}
