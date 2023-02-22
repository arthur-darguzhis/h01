import {User} from "../types/UserType";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";
import {UserModel} from "../model/UserModel";
import {injectable} from "inversify";

@injectable()
export class UserRepository {
    async add(user: User): Promise<User> {
        await UserModel.create(user)
        return user
    }

    async find(id: string): Promise<User | null> {
        return UserModel.findOne({_id: id});
    }

    async get(id: string): Promise<User | never> {
        const user = await UserModel.findOne({_id: id});
        if (!user) throw new EntityNotFound(`User with ID: ${id} is not exists`);
        return user
    }

    async update(id: string, updateFilter: object): Promise<boolean> {
        const result = await UserModel.updateOne({_id: id}, {$set: updateFilter})
        return result.modifiedCount === 1;
    }

    async delete(id: string): Promise<boolean> {
        const result = await UserModel.deleteOne({_id: id});
        return result.deletedCount === 1;
    }

    async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
        return UserModel.findOne({
            $or: [
                {login: loginOrEmail},
                {email: loginOrEmail}
            ]
        });
    }

    async isExistsWithSameEmailOrLogin(email: string, login: string): Promise<boolean> {
        const user = await UserModel.findOne({
            $or: [
                {email: email},
                {login: login}
            ]
        })
        return !!user;
    }

    async getUserByEmail(email: string): Promise<User | never> {
        const user = await UserModel.findOne({email: email})
        if (!user) throw new EntityNotFound(`User with email: ${email} is not exists`)
        return user
    }

    async activeUser(userId: string) {
        const result = await UserModel.updateOne({_id: userId}, {$set: {isActive: true}})
        return result.modifiedCount === 1;
    }

    async setNewPassword(userId: string, newPasswordHash: string) {
        const result = await UserModel.updateOne({_id: userId}, {$set: {passwordHash: newPasswordHash}})
        return result.modifiedCount === 1;
    }
}
