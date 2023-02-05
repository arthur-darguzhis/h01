import {UserType} from "./types/UserType";
import {dbConnection} from "../../db";
import {EntityNotFound} from "../../common/exceptions/EntityNotFound";
import {CommandMongoDbRepository} from "../../common/repositories/CommandMongoDbRepository";

class UserRepository extends CommandMongoDbRepository<UserType, object> {
    async findByLoginOrEmail(loginOrEmail: string): Promise<UserType | null> {
        return await this.collection.findOne({
            $or: [
                {login: loginOrEmail},
                {email: loginOrEmail}
            ]
        })
    }

    async isExistsWithSameEmailOrLogin(email: string, login: string): Promise<boolean> {
        const user = await this.collection.findOne({
            $or: [
                {email: email},
                {login: login}
            ]
        })
        return !!user;
    }

    async getUserByEmail(email: string): Promise<UserType | never> {
        const user = await this.collection.findOne({email: email})
        if (!user) throw new EntityNotFound(`User with email: ${email} is not exists`)
        return user
    }

    async activeUser(userId: string) {
        const result = await this.collection.updateOne({_id: userId}, {$set: {isActive: true}})
        return result.matchedCount === 1;
    }
}

export const userRepository = new UserRepository(dbConnection, 'users')
