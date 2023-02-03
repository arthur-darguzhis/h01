import jwt from 'jsonwebtoken';
import {UserType} from "../domain/types/UserType";
import {settings} from "../settings";
import {refreshTokensBlackListRepository} from "../modules/auth/refreshTokensBlackListRepository";
import {JWT} from "./types/JWT";

export const jwtService = {
    createAuthJWT(user: UserType): string{
        return jwt.sign({userId: user._id}, settings.JWT_AUTH_SECRET, {expiresIn: '10s'})
    },

    createRefreshJWT(user: UserType): string {
        return jwt.sign({userId: user._id}, settings.JWT_REFRESH_SECRET, {expiresIn: '20s'})
    },

    verifyAuthJWT(token: string) {
        try {
            return jwt.verify(token, settings.JWT_AUTH_SECRET);
        } catch (err) {
            throw new Error('refresh JWT is invalid');
        }
    },

    verifyRefreshJWT(token: string) {
        try {
            return jwt.verify(token, settings.JWT_REFRESH_SECRET);
        } catch (err) {
            throw new Error('refresh JWT is invalid');
        }
    },

    getUserIdByAuthJWT(token: string) {
        try {
            const result: any = jwt.verify(token, settings.JWT_AUTH_SECRET)
            return result.userId;
        } catch (error) {
            return null;
        }
    },

    getUserIdByRefreshJWT(token: string){
        try {
            const result: any = jwt.verify(token, settings.JWT_REFRESH_SECRET)
            return result.userId;
        } catch (error) {
            return null;
        }
    },

    async addRefreshJWTtoBlackList(user: UserType, refreshJWT: string): Promise<JWT> {
        return await refreshTokensBlackListRepository.addTokenInBlackList(user,refreshJWT);
    }
}
