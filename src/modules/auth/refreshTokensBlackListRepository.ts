import {refreshTokenBlackListCollection} from "../../db";
import {JWT} from "../../application/types/JWT";
import {ObjectId} from "mongodb";
import {UserType} from "../../domain/types/UserType";

export const refreshTokensBlackListRepository = {
    async isTokenInBlackList(userId: string, refreshToken: string): Promise<JWT | null> {
        return await refreshTokenBlackListCollection.findOne({userId: userId, refreshToken: refreshToken})
    },

    async addTokenInBlackList(user: UserType, refreshToken: string): Promise<JWT> {
        const jwt: JWT = {
            _id: new ObjectId().toString(),
            userId: user._id,
            refreshToken: refreshToken
        }
        await refreshTokenBlackListCollection.insertOne(jwt)
        return jwt
    }
}
