import {QueryMongoDbRepository} from "../../common/repositories/QueryMongoDbRepository";
import {UserActiveSessionViewModelType} from "./types/UserActiveSessionViewModelType";
import {UserActiveSessionType} from "./types/UserActiveSessionType";
import {dbConnection} from "../../db";
import {mapUserActiveSessionToViewModel} from "./userActiveSession.mapper";

class UsersActiveSessionsQueryRepository extends QueryMongoDbRepository<UserActiveSessionType, UserActiveSessionViewModelType> {
    async findByUserId(userId: string) {
        const activeSessions = await this.collection.find({userId: userId}).toArray()
        return activeSessions.map(mapUserActiveSessionToViewModel)
    }
}

export const usersActiveSessionsQueryRepository = new UsersActiveSessionsQueryRepository(dbConnection, 'usersActiveSessions', mapUserActiveSessionToViewModel)
