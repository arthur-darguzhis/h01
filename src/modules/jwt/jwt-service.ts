import jwt from 'jsonwebtoken';
import {UserType} from "../user/types/UserType";
import {settings} from "../../settings";
import {refreshTokensBlackListRepository} from "../auth/refreshTokensBlackListRepository";
import {jwtType} from "./types/JwtType";
import {ObjectId} from "mongodb";
import {InvalidValue} from "../../common/exceptions/InvalidValue";

export const jwtService = {
    createAuthJWT(user: UserType): string {
        return jwt.sign({userId: user._id}, settings.JWT_AUTH_SECRET, {expiresIn: '10m'})
    },

    createRefreshJWT(user: UserType): string {
        return jwt.sign({userId: user._id}, settings.JWT_REFRESH_SECRET, {expiresIn: '14d'})
    },

    verifyAuthJWT(token: string) {
        try {
            return jwt.verify(token, settings.JWT_AUTH_SECRET);
        } catch (err) {
            throw new InvalidValue('refresh JWT is invalid');
        }
    },

    verifyRefreshJWT(token: string) {
        try {
            return jwt.verify(token, settings.JWT_REFRESH_SECRET);
        } catch (err) {
            throw new InvalidValue('refresh JWT is invalid');
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

    getUserIdByRefreshJWT(token: string) {
        try {
            const result: any = jwt.verify(token, settings.JWT_REFRESH_SECRET)
            return result.userId;
        } catch (error) {
            return null;
        }
    },

    async addRefreshJWTtoBlackList(user: UserType, refreshJWT: string) {
        const jwt: jwtType = {
            _id: new ObjectId().toString(),
            userId: user._id,
            refreshToken: refreshJWT
        }
        await refreshTokensBlackListRepository.add( jwt);
    }
}
