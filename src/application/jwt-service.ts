import jwt from 'jsonwebtoken';
import {UserType} from "../domain/types/UserType";
import {settings} from "../settings";

export const jwtService = {
    async createJWT(user: UserType): Promise<string> {
        const token = jwt.sign({userId: user._id}, settings.JWT_SECRET, {expiresIn: '10m'})
        return token;
    },

    async getUserIdByToken(token: string): Promise<string | null> {
        try {
            const result: any = jwt.verify(token, settings.JWT_SECRET)
            return result.userId;
        } catch (error) {
            return null;
        }
    }
}
