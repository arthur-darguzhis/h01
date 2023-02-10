import mongoose from "mongoose";
import {settings} from "../../settings";

export const cleanDbBeforeTest = async () => {
    await mongoose.disconnect();
    mongoose.set('strictQuery', true);
    const con = await mongoose.connect(settings.MONGO_URI, {dbName: settings.MONGO_DB_NAME})
    await con.connection.dropDatabase();
}

export const closeTestMongooseConnection = async () => {
    await mongoose.disconnect();
}
