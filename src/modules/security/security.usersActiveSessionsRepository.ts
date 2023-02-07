import {dbConnection} from "../../db";
import {CommandMongoDbRepository} from "../../common/repositories/CommandMongoDbRepository";
import {UserActiveSessionType} from "./types/UserActiveSessionType";

class UsersActiveSessionsRepository extends CommandMongoDbRepository<UserActiveSessionType, object> {

    async deleteUserSessionBy(userId: string, deviceId: string): Promise<boolean> {
        const result = await this.collection.deleteOne({userId: userId, deviceId: deviceId})
        return result.deletedCount === 1
    }
}

export const usersActiveSessionsRepository = new UsersActiveSessionsRepository(dbConnection, 'usersActiveSessions')
