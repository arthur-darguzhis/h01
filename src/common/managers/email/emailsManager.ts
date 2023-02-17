import {settings} from "../../../settings";
import {User} from "../../../modules/user/types/UserType";
import {emailAdapter} from "../../adapters/emailAdapter";
import {EmailConfirmation} from "../../../modules/auth/emailConfirmation/types/EmailConfirmation";
import {PasswordRecovery} from "../../../modules/auth/passwordRecovery/types/PasswordRecoveryType";
import {EmailDto} from "./types/EmailDto";

export const emailsManager = {
    sendRegistrationConfirmationLetter(user: User, emailConfirmation: EmailConfirmation): void {
        const confirmUrl = settings.APP_HOST + 'confirm-registration?code=' + emailConfirmation.confirmationCode;
        const preparedMail = new EmailDto(
            `"Artur Darguzhis" <${settings.GMAIL_APP_LOGIN}>`,
            user.email,
            'Thank for your registration',
            `<p>To finish registration please follow the link below:
                      <a href='${confirmUrl}'>complete registration</a>
                   </p>`
        );

        emailAdapter.sendMail(preparedMail)
    },

    sendPasswordRecoveryLetter(user: User, passwordRecoveryCode: PasswordRecovery): void {
        const confirmUrl = settings.APP_HOST + 'password-recovery?recoveryCode=' + passwordRecoveryCode.code;
        const preparedMail = new EmailDto(
            `"Artur Darguzhis" <${settings.GMAIL_APP_LOGIN}>`,
            user.email,
            'Password recovery',
            `<p>To finish password recovery please follow the link below:
                      <a href='${confirmUrl}'>recovery password</a>
                   </p>`
        );

        emailAdapter.sendMail(preparedMail)
    }
}
