import {settings} from "../settings";
import {UserType} from "../domain/types/UserType";
import {emailAdapter} from "../adapters/emailAdapter";
import {EmailConfirmationType} from "../modules/emailConfirmation/types/EmailConfirmationType";

export const emailsManager = {
    sendRegistrationConfirmationLetter(user: UserType, emailConfirmation: EmailConfirmationType): void {
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

        emailAdapter.sendMail(preparedMail)
    }
}
