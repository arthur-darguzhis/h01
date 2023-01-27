export const settings = {
    JWT_SECRET: process.env.JWT_SECRET || "iej_ahBn5!k2#",
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/',
    APP_HOST: process.env.APP_HOST || 'http://localhost:3000/',
    GMAIL_APP_LOGIN: process.env.GMAIL_APP_LOGIN,
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD,
}
