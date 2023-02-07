import {usersActiveSessionsRepository} from "./security.usersActiveSessionsRepository";
import {UserActiveSessionType} from "./types/UserActiveSessionType";
import {jwtService} from "../jwt/jwt-service";
import {UserActiveSessionUpdateModelType} from "./types/UserActiveSessionUpdateModelType";

export const securityService = {
    async registerUserActiveSession(session: UserActiveSessionType) {
        await usersActiveSessionsRepository.add(session)
    },

    async removeUserSession(refreshToken: string): Promise<boolean> {
        const decodedRefreshToken = jwtService.decodeRefreshJWT(refreshToken);
        return await usersActiveSessionsRepository.deleteByDeviceId(decodedRefreshToken!.deviceId)
    },

    async updateUserActiveSession(deviceId: string, userActiveSessionUpdateModel: UserActiveSessionUpdateModelType) {
        return await usersActiveSessionsRepository.updateByDeviceId(deviceId,userActiveSessionUpdateModel)
    }
}
