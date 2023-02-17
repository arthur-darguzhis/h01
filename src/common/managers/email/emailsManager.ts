import {settings} from "../../../settings";
import {User} from "../../../modules/user/types/UserType";
import {emailAdapter} from "../../adapters/emailAdapter";
import {EmailConfirmationType} from "../../../modules/auth/emailConfirmation/types/EmailConfirmationType";
import {PasswordRecovery} from "../../../modules/auth/passwordRecovery/types/PasswordRecoveryType";

export const emailsManager = {
    sendRegistrationConfirmationLetter(user: User, emailConfirmation: EmailConfirmationType): void {
        const confirmUrl = settings.APP_HOST + 'confirm-registration?code=' + emailConfirmation.confirmationCode;
        const preparedMail = {
            from: `"Artur Darguzhis" <${settings.GMAIL_APP_LOGIN}>`,
            to: user.email,
            subject: 'Thank for your registration',
            html: `<p>To finish registration please follow the link below:
                      <a href='${confirmUrl}'>complete registration</a>
                   </p>`
        };

        emailAdapter.sendMail(preparedMail)
    },

    sendPasswordRecoveryLetter(user: User, passwordRecoveryCode: PasswordRecovery): void {
        const confirmUrl = settings.APP_HOST + 'password-recovery?recoveryCode=' + passwordRecoveryCode.code;
        const preparedMail = {
            from: `"Artur Darguzhis" <${settings.GMAIL_APP_LOGIN}>`,
            to: user.email,
            subject: 'Password recovery',
            html: `<p>To finish password recovery please follow the link below:
                      <a href='${confirmUrl}'>recovery password</a>
                   </p>`
        };

        emailAdapter.sendMail(preparedMail)
    }
}
