export type PasswordRecoveryType = {
    _id: string
    userId: string
    code: string,
    expirationDate: number,
    sendingTime: number,
    isConfirmed: boolean,
}
