import jwt, {JwtPayload} from 'jsonwebtoken';
import {User} from "../../user/types/UserType";
import {settings} from "../../../settings";
import {InvalidValue} from "../../../common/exceptions/InvalidValue";
import {v4 as uuidv4} from "uuid";
import {UnprocessableEntity} from "../../../common/exceptions/UnprocessableEntity";

export const jwtService = {
    createAuthJWT(user: User): string {
        return jwt.sign({userId: user._id}, settings.JWT_AUTH_SECRET, {expiresIn: '10m'})
    },

    createRefreshJWT(user: User, deviceId: string = uuidv4()): string {
        return jwt.sign({userId: user._id, deviceId: deviceId}, settings.JWT_REFRESH_SECRET, {expiresIn: '14d'})
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

    getUserIdFromAccessToken(token: string) {
        try {
            const result: any = jwt.verify(token, settings.JWT_AUTH_SECRET)
            return result.userId;
        } catch (error) {
            return null;
        }
    },

    decodeRefreshJWT(token: string): JwtPayload {
        const jwtPayload = jwt.decode(token, {json: true})
        if (!jwtPayload) {
            throw new UnprocessableEntity('JWT is invalid')
        }
        return jwtPayload
    },

    getDeviceIdFromRefreshToken(token: string): string {
        const decodedToken = this.decodeRefreshJWT(token)
        return decodedToken?.deviceId;
    },

    getUserIdFromRefreshToken(token: string): string {
        const decodedToken = this.decodeRefreshJWT(token)
        return decodedToken?.userId;
    }
}
