export type UserActiveSessionType = {
    _id: string
    issuedAt: number | undefined
    expireAt: number | undefined
    deviceId: string
    IP: string
    deviceName: string
    userId: string
}
