import {dbConnection} from "../../db";
import {CommandMongoDbRepository} from "../../common/repositories/CommandMongoDbRepository";
import {UserActiveSessionType} from "./types/UserActiveSessionType";
import {UserActiveSessionUpdateModelType} from "./types/UserActiveSessionUpdateModelType";
import {EntityNotFound} from "../../common/exceptions/EntityNotFound";

class UsersActiveSessionsRepository extends CommandMongoDbRepository<UserActiveSessionType, object> {

    async getByDeviceId(deviceId: string): Promise<UserActiveSessionType> {
        const userActiveSession = await this.collection.findOne({deviceId: deviceId})
        if (!userActiveSession) throw new EntityNotFound(`There is not session for deviceId: ${deviceId}`)
        return userActiveSession
    }

    async deleteByDeviceId(deviceId: string): Promise<boolean> {
        const result = await this.collection.deleteOne({deviceId: deviceId})
        return result.deletedCount === 1
    }

    async updateByDeviceId(deviceId: string, userActiveSessionUpdateModel: UserActiveSessionUpdateModelType): Promise<boolean> {
        const result = await this.collection.updateOne({deviceId: deviceId}, {$set: userActiveSessionUpdateModel})
        return result.matchedCount === 1;
    }

    async removeOtherDeviceSessions(userId: string, deviceId: string): Promise<void> {
        await this.collection.deleteMany({userId: userId, deviceId: {"$ne": deviceId }})
    }

    deleteUserSessionByDeviceId(userId: string, deviceId: string) {
        this.collection.deleteOne({userId: userId, deviceId: deviceId})
    }
}

export const usersActiveSessionsRepository = new UsersActiveSessionsRepository(dbConnection, 'usersActiveSessions')
