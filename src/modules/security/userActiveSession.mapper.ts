import {UserActiveSession} from "./types/UserActiveSessionType";
import {UserActiveSessionViewModelType} from "./types/UserActiveSessionViewModelType";

export const mapUserActiveSessionToViewModel = (userActiveSession: UserActiveSession): UserActiveSessionViewModelType => {
    return {
        ip: userActiveSession.ip,
        title: userActiveSession.deviceName,
        lastActiveDate: new Date(userActiveSession.issuedAt! * 1000).toISOString(),
        deviceId: userActiveSession.deviceId
    }
}
