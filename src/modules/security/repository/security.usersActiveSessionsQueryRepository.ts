import {QueryMongoDbRepository} from "../../../common/repositories/QueryMongoDbRepository";
import {UserActiveSessionViewModelType} from "../types/UserActiveSessionViewModelType";
import {UserActiveSessionType} from "../types/UserActiveSessionType";
import {mapUserActiveSessionToViewModel} from "../userActiveSession.mapper";
import {UserActiveSessionModel} from "../model/UserActiveSessionModel";

class UsersActiveSessionsQueryRepository extends QueryMongoDbRepository<UserActiveSessionType, UserActiveSessionViewModelType> {
    async findByUserId(userId: string) {
        const activeSessions = await this.model.find({userId: userId}).lean()
        return activeSessions.map(mapUserActiveSessionToViewModel)
    }
}

export const usersActiveSessionsQueryRepository = new UsersActiveSessionsQueryRepository(UserActiveSessionModel, mapUserActiveSessionToViewModel, 'User Active Session')
