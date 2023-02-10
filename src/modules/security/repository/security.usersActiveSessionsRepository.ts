import {CommandMongoDbRepository} from "../../../common/repositories/CommandMongoDbRepository";
import {UserActiveSessionType} from "../types/UserActiveSessionType";
import {UserActiveSessionUpdateModelType} from "../types/UserActiveSessionUpdateModelType";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";
import {UserActiveSessionModel} from "../model/UserActiveSessionModel";

class UsersActiveSessionsRepository extends CommandMongoDbRepository<UserActiveSessionType, object> {

    async getByDeviceId(deviceId: string): Promise<UserActiveSessionType> {
        const userActiveSession = await this.model.findOne({deviceId: deviceId})
        if (!userActiveSession) throw new EntityNotFound(`There is not session for deviceId: ${deviceId}`)
        return userActiveSession
    }

    async deleteByDeviceId(deviceId: string): Promise<boolean> {
        const result = await this.model.deleteOne({deviceId: deviceId})
        return result.deletedCount === 1
    }

    async updateByDeviceId(deviceId: string, userActiveSessionUpdateModel: UserActiveSessionUpdateModelType): Promise<boolean> {
        const result = await this.model.updateOne({deviceId: deviceId}, {$set: userActiveSessionUpdateModel})
        return result.modifiedCount === 1;
    }

    async removeOtherDeviceSessions(userId: string, deviceId: string): Promise<void> {
        await this.model.deleteMany({userId: userId, deviceId: {"$ne": deviceId}})
    }

    async deleteUserSessionByDeviceId(userId: string, deviceId: string) {
        await this.model.deleteOne({userId: userId, deviceId: deviceId})
    }
}

export const usersActiveSessionsRepository = new UsersActiveSessionsRepository(UserActiveSessionModel, 'User Active Session')
