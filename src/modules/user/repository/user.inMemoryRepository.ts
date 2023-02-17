import {User} from "../types/UserType";
import {db} from "../../../db";

export const userInMemoryRepository = {
    isExists(login: string, password: string): boolean {
        const user = this.findUserByLogin(login);
        return !!(user && (user.passwordHash === btoa(password)));
    },

    findUserByLogin(login: string): User | undefined {
        return db.users.find(u => u.login === login);
    }
}
