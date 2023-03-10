import {UserType} from "../types/UserType";
import {db} from "../db";

export const userRepository = {
    isUserExists(login: string, password: string): boolean {
        const user = this.findUserByLogin(login);
        return !!(user && (user.password === password));
    },

    findUserByLogin(login: string): UserType | undefined {
        return db.users.find(u => u.login === login);
    }
}
