import {usersActiveSessionsRepository} from "./security.usersActiveSessionsRepository";
import {UserActiveSessionType} from "./types/UserActiveSessionType";
import {jwtService} from "../jwt/jwt-service";
import {UserActiveSessionUpdateModelType} from "./types/UserActiveSessionUpdateModelType";
import {Forbidden} from "../../common/exceptions/Forbidden";

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
    },

    async removeAllUserSessions(userId: string) {
        return await usersActiveSessionsRepository.deleteAllUsersSessions(userId)
    },

    async removeUserSessionsByDeviceId(userId: string, deviceId: string): Promise<true | never> {
        const userActiveSession = await usersActiveSessionsRepository.getByDeviceId(deviceId);

        if(userActiveSession.userId !== userId){
            throw new Forbidden("Unable to delete session")
        }

        usersActiveSessionsRepository.deleteUserSessionByDeviceId(userId,deviceId)
        return true;
    }
}