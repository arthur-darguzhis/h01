import {settings} from "../settings";
import {UserType} from "../domain/types/UserType";
import {MailIsNotSent} from "../domain/exceptions/MailIsNotSent";
import {emailAdapter} from "../adapters/emailAdapter";
import {userRepository} from "../modules/user/user.MongoDbRepository";

export const emailsManager = {
    async sendConfirmationLetter(user: UserType): Promise<true | never> {
        if (!user.emailConfirmation!.confirmationCode || !user.email) {
            throw new MailIsNotSent('something wrong with confirmationCode or user email is empty');
        }

        const confirmUrl = settings.APP_HOST + 'confirm-registration?code=' + user.emailConfirmation!.confirmationCode;

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
        await userRepository.updateUser(user._id, {"emailConfirmation.sendingTime": new Date().getTime()})
        return true;
    }
}
