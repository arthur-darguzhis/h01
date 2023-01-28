export type UserType = {
    _id: string
    login: string,
    password: string,
    email: string,
    createdAt: string
    isActive: boolean
    emailConfirmation: UserEmailConfirmation
}

export type UserEmailConfirmation = {
    confirmationCode?: string,
    expirationDate?: number,
    sendingTime?: number,
    isConfirmed?: boolean,
}
