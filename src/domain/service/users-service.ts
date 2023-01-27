import {UserInputModel} from "../../routes/inputModels/UserInputModel";
import {UserType} from "../types/UserType";
import {ObjectId} from "mongodb";
import {userRepository} from "../../repository/userMongoDbRepository";
import bcrypt from 'bcrypt'
import {EntityAlreadyExists} from "../exceptions/EntityAlreadyExists";
import nodemailer from 'nodemailer'
import {settings} from "../../settings";

export const usersService = {
    async createUser(userInputModel: UserInputModel): Promise<string> {
        const passwordHash = await this._generatePasswordHash(userInputModel.password)

        const newUser: UserType = {
            _id: new ObjectId().toString(),
            login: userInputModel.login,
            password: passwordHash,
            email: userInputModel.email,
            createdAt: new Date().toISOString()
        }

        const user = await userRepository.addUser(newUser);
        return user._id.toString();
    },

    async findUserById(id: string): Promise<UserType | null> {
        return await userRepository.findUser(id);
    },

    async deleteUser(id: string): Promise<boolean> {
        return await userRepository.deleteUser(id)
    },

    async deleteAllUsers(): Promise<void> {
        await userRepository.deleteAllUsers()
    },

    async checkCredentials(loginOrEmail: string, password: string): Promise<UserType | false> {
        const user = await userRepository.findByLoginOrEmail(loginOrEmail)
        if (!user) return false;

        const areCredentialValid = await bcrypt.compare(password, user.password);
        if (!areCredentialValid) return false;

        return user;
    },

    async _generatePasswordHash(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    },

    async registerUser(userInputModel: UserInputModel): Promise<true | never> {
        const isUserExists = await userRepository.isUserExists(userInputModel.email, userInputModel.login);
        if(isUserExists){
            throw new EntityAlreadyExists('User with the same "email" or "login" is already exists')
        }

        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: settings.GMAIL_APP_LOGIN,
                pass: settings.GMAIL_APP_PASSWORD,
            },
        });

        const confirmCode = new ObjectId().toString();
        const confirmUrl = settings.APP_HOST+'confirm-email?code='+confirmCode;

        const mailOptions = {
            from: settings.GMAIL_APP_LOGIN,
            to: userInputModel.email,
            subject: 'Thank for your registration',
            html: `<h1>Thank for your registration</h1>
                   <p>To finish registration please follow the link below:
                      <a href='${confirmUrl}'>complete registration</a>
                  </p>`
        };

        await transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
                // do something useful
            }
        });

        // TODO здесь отправлять email. это еще один сервис дернуть. или метод
        return true;
    }
}
