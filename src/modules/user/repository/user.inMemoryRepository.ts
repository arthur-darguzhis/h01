import {User} from "../types/UserType";
import {db} from "../../../db";


export const userInMemoryRepository = {
    isExists(login: string, password: string): boolean {
        const user = this.findUserByLogin(login);
        return !!(user && (user.passwordHash === Buffer.from(password).toString("base64")));
    },

    findUserByLogin(login: string): User | undefined {
        return db.users.find(u => u.login === login);
    }
}
