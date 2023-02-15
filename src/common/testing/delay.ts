export const delay = (milliseconds: number): Promise<void> => {
    return new Promise((resolve, _) => {
        setTimeout(() => {
            resolve()
        }, milliseconds);
    })
}
