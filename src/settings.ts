import * as dotenv from "dotenv";
dotenv.config()

export const settings = {
    PORT: process.env.PORT || 3000,
    JWT_AUTH_SECRET: process.env.JWT_AUTH_SECRET || "iej_ahBn5!k2#",
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "ek4j2m_u*!.^",
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/',
    MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'hw',
    APP_HOST: process.env.APP_HOST || 'http://localhost:3000/',
    GMAIL_APP_LOGIN: process.env.GMAIL_APP_LOGIN,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
}
