import {UserActiveSessionType} from "./types/UserActiveSessionType";
import {UserActiveSessionViewModelType} from "./types/UserActiveSessionViewModelType";

export const mapUserActiveSessionToViewModel = (userActiveSession: UserActiveSessionType): UserActiveSessionViewModelType => {
    return {
        ip: userActiveSession.IP,
        title: userActiveSession.deviceName,
        lastActiveDate: new Date(userActiveSession.issuedAt! * 1000).toISOString(),
        deviceId: userActiveSession.deviceId
    }
}
