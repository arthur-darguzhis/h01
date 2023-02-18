import {UsersActiveSessionsRepository,} from "./repository/security.usersActiveSessionsRepository";
import {UserActiveSession} from "./types/UserActiveSessionType";
import {jwtService} from "../auth/jwt/jwtService";
import {UserActiveSessionUpdateModelType} from "./types/UserActiveSessionUpdateModelType";
import {Forbidden} from "../../common/exceptions/Forbidden";

export class SecurityService {
    private usersActiveSessionsRepository: UsersActiveSessionsRepository

    constructor() {
        this.usersActiveSessionsRepository = new UsersActiveSessionsRepository();
    }

    async registerUserActiveSession(session: UserActiveSession) {
        await this.usersActiveSessionsRepository.add(session)
    }

    async removeUserSession(refreshToken: string): Promise<boolean> {
        const decodedRefreshToken = jwtService.decodeRefreshJWT(refreshToken);
        return this.usersActiveSessionsRepository.deleteByDeviceId(decodedRefreshToken!.deviceId)
    }

    async updateUserActiveSession(deviceId: string, userActiveSessionUpdateModel: UserActiveSessionUpdateModelType) {
        return await this.usersActiveSessionsRepository.updateByDeviceId(deviceId, userActiveSessionUpdateModel)
    }

    async removeOtherDeviceSessions(userId: string, deviceId: string) {
        return await this.usersActiveSessionsRepository.removeOtherDeviceSessions(userId, deviceId)
    }

    async removeUserSessionsByDeviceId(userId: string, deviceId: string): Promise<true | never> {
        const userActiveSession = await this.usersActiveSessionsRepository.getByDeviceId(deviceId);

        if (userActiveSession.userId !== userId) {
            throw new Forbidden("Unable to delete session")
        }

        await this.usersActiveSessionsRepository.deleteUserSessionByDeviceId(userId, deviceId)
        return true;
    }
}
