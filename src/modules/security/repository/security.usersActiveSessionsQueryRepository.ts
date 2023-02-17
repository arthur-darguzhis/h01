import {QueryMongoDbRepository} from "../../../common/repositories/QueryMongoDbRepository";
import {UserActiveSessionViewModelType} from "../types/UserActiveSessionViewModelType";
import {mapUserActiveSessionToViewModel} from "../userActiveSession.mapper";
import {UserActiveSessionModel} from "../model/UserActiveSessionModel";
import {UserActiveSession} from "../types/UserActiveSessionType";

class UsersActiveSessionsQueryRepository extends QueryMongoDbRepository<UserActiveSession, UserActiveSessionViewModelType> {
    async findByUserId(userId: string) {
        const activeSessions = await this.model.find({userId: userId}).lean()
        return activeSessions.map(mapUserActiveSessionToViewModel)
    }
}

export const usersActiveSessionsQueryRepository = new UsersActiveSessionsQueryRepository(UserActiveSessionModel, mapUserActiveSessionToViewModel, 'User Active Session')
