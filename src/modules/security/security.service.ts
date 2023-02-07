import {usersActiveSessionsRepository} from "./security.usersActiveSessionsRepository";
import {UserActiveSessionType} from "./types/UserActiveSessionType";
import {jwtService} from "../jwt/jwt-service";

export const securityService = {
    async registerUserActiveSession(session: UserActiveSessionType) {
        await usersActiveSessionsRepository.add(session)
    },

    async removeUserSession(refreshToken: string): Promise<boolean> {
        const decodedRefreshToken = jwtService.decodeRefreshJWT(refreshToken);
        return await usersActiveSessionsRepository.deleteUserSessionBy(decodedRefreshToken!.userId, decodedRefreshToken!.deviceId)
    }
}
