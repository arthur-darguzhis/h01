import {UserActiveSession} from "../types/UserActiveSessionType";
import {UserActiveSessionUpdateModelType} from "../types/UserActiveSessionUpdateModelType";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";
import {UserActiveSessionModel} from "../model/UserActiveSessionModel";

export class UsersActiveSessionsRepository {

    async add(UserActiveSession: UserActiveSession): Promise<UserActiveSession> {
        await UserActiveSessionModel.create(UserActiveSession)
        return UserActiveSession
    }

    async find(id: string): Promise<UserActiveSession | null> {
        return UserActiveSessionModel.findOne({_id: id});
    }

    async get(id: string): Promise<UserActiveSession | never> {
        const userActiveSession = await UserActiveSessionModel.findOne({_id: id});
        if (!userActiveSession) throw new EntityNotFound(`User Active Session with ID: ${id} is not exists`);
        return userActiveSession
    }

    async update(id: string, updateFilter: object): Promise<boolean> {
        const result = await UserActiveSessionModel.updateOne({_id: id}, {$set: updateFilter})
        return result.modifiedCount === 1;
    }

    async delete(id: string): Promise<boolean> {
        const result = await UserActiveSessionModel.deleteOne({_id: id});
        return result.deletedCount === 1;
    }

    async getByDeviceId(deviceId: string): Promise<UserActiveSession> {
        const userActiveSession = await UserActiveSessionModel.findOne({deviceId: deviceId})
        if (!userActiveSession) throw new EntityNotFound(`There is not session for deviceId: ${deviceId}`)
        return userActiveSession
    }

    async deleteByDeviceId(deviceId: string): Promise<boolean> {
        const result = await UserActiveSessionModel.deleteOne({deviceId: deviceId})
        return result.deletedCount === 1
    }

    async updateByDeviceId(deviceId: string, userActiveSessionUpdateModel: UserActiveSessionUpdateModelType): Promise<boolean> {
        const result = await UserActiveSessionModel.updateOne({deviceId: deviceId}, {$set: userActiveSessionUpdateModel})
        return result.modifiedCount === 1;
    }

    async removeOtherDeviceSessions(userId: string, deviceId: string): Promise<void> {
        await UserActiveSessionModel.deleteMany({userId: userId, deviceId: {"$ne": deviceId}})
    }

    async deleteUserSessionByDeviceId(userId: string, deviceId: string) {
        await UserActiveSessionModel.deleteOne({userId: userId, deviceId: deviceId})
    }
}
