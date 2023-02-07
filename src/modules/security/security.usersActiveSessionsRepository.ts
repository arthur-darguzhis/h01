import {dbConnection} from "../../db";
import {CommandMongoDbRepository} from "../../common/repositories/CommandMongoDbRepository";
import {UserActiveSessionType} from "./types/UserActiveSessionType";
import {UserActiveSessionUpdateModelType} from "./types/UserActiveSessionUpdateModelType";

class UsersActiveSessionsRepository extends CommandMongoDbRepository<UserActiveSessionType, object> {

    async deleteByDeviceId(deviceId: string): Promise<boolean> {
        const result = await this.collection.deleteOne({deviceId: deviceId})
        return result.deletedCount === 1
    }

    async updateByDeviceId(deviceId: string, userActiveSessionUpdateModel: UserActiveSessionUpdateModelType): Promise<boolean> {
        const result = await this.collection.updateOne({deviceId: deviceId}, {$set: userActiveSessionUpdateModel})
        return result.matchedCount === 1;
    }
}

export const usersActiveSessionsRepository = new UsersActiveSessionsRepository(dbConnection, 'usersActiveSessions')
