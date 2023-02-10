import {UserType} from "./modules/user/types/UserType";
import {settings} from "./settings";
import * as mongoose from "mongoose";
import {errorHandler} from "./common/managers/error/ErrorHandler";

//Расскажите почему эта функция не стрелочная и при чем здесь замыкание и переменная client? =)
export async function runDb() {
    try {
        mongoose.set('strictQuery', true); //Для чего эта настройка?
        const mongooseConnection = await mongoose.connect(settings.MONGO_URI, {dbName: settings.MONGO_DB_NAME})
        console.log('Connected successfully to mongoServer');

        mongooseConnection.connection.on('error', err => {
            errorHandler.handleError(err);
        });
    } catch (e) {
        console.log(e);
        //Ensure that the client will close when you finish/error
        await mongoose.disconnect();
    }
}

export const db: { users: UserType[] } = {
    users: [
        {
            _id: '1009',
            login: 'admin',
            password: 'cXdlcnR5',
            email: 'test@test.ts',
            isActive: true,
            createdAt: '',
        }
    ]
}
