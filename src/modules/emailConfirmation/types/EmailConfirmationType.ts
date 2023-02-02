export type EmailConfirmationType = {
    _id: string
    userId: string
    confirmationCode: string,
    expirationDate: number,
    sendingTime: number,
    isConfirmed: boolean,
}
