import {UserType} from "../types/UserType";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";
import {CommandMongoDbRepository} from "../../../common/repositories/CommandMongoDbRepository";
import {UserModel} from "../model/UserModel";

class UserRepository extends CommandMongoDbRepository<UserType, object> {
    async findByLoginOrEmail(loginOrEmail: string): Promise<UserType | null> {
        return await this.model.findOne({
            $or: [
                {login: loginOrEmail},
                {email: loginOrEmail}
            ]
        })
    }

    async isExistsWithSameEmailOrLogin(email: string, login: string): Promise<boolean> {
        const user = await this.model.findOne({
            $or: [
                {email: email},
                {login: login}
            ]
        })
        return !!user;
    }

    async getUserByEmail(email: string): Promise<UserType | never> {
        const user = await this.model.findOne({email: email})
        if (!user) throw new EntityNotFound(`User with email: ${email} is not exists`)
        return user
    }

    async activeUser(userId: string) {
        const result = await this.model.updateOne({_id: userId}, {$set: {isActive: true}})
        return result.modifiedCount === 1;
    }

    async setNewPassword(userId: string, newPasswordHash: string) {
        const result = await this.model.updateOne({_id: userId}, {$set: {password: newPasswordHash}})
        return result.modifiedCount === 1;
    }
}

export const userRepository = new UserRepository(UserModel, 'User')
