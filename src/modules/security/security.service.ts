import {usersActiveSessionsRepository} from "./repository/security.usersActiveSessionsRepository";
import {UserActiveSession} from "./types/UserActiveSessionType";
import {jwtService} from "../auth/jwt/jwt-service";
import {UserActiveSessionUpdateModelType} from "./types/UserActiveSessionUpdateModelType";
import {Forbidden} from "../../common/exceptions/Forbidden";

export const securityService = {
    async registerUserActiveSession(session: UserActiveSession) {
        await usersActiveSessionsRepository.add(session)
    },

    async removeUserSession(refreshToken: string): Promise<boolean> {
        const decodedRefreshToken = jwtService.decodeRefreshJWT(refreshToken);
        return usersActiveSessionsRepository.deleteByDeviceId(decodedRefreshToken!.deviceId)
    },

    async updateUserActiveSession(deviceId: string, userActiveSessionUpdateModel: UserActiveSessionUpdateModelType) {
        return await usersActiveSessionsRepository.updateByDeviceId(deviceId,userActiveSessionUpdateModel)
    },

    async removeOtherDeviceSessions(userId: string, deviceId: string) {
        return await usersActiveSessionsRepository.removeOtherDeviceSessions(userId, deviceId)
    },

    async removeUserSessionsByDeviceId(userId: string, deviceId: string): Promise<true | never> {
        const userActiveSession = await usersActiveSessionsRepository.getByDeviceId(deviceId);

        if(userActiveSession.userId !== userId){
            throw new Forbidden("Unable to delete session")
        }

        await usersActiveSessionsRepository.deleteUserSessionByDeviceId(userId, deviceId)
        return true;
    }
}
