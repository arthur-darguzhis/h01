import {UserActiveSessionViewModelType} from "../types/UserActiveSessionViewModelType";
import {mapUserActiveSessionToViewModel} from "../userActiveSession.mapper";
import {UserActiveSessionModel} from "../model/UserActiveSessionModel";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";

class UsersActiveSessionsQueryRepository {
    async find(id: string): Promise<UserActiveSessionViewModelType | null> {
        const userActiveSession = await UserActiveSessionModel.findOne({_id: id});
        return userActiveSession ? mapUserActiveSessionToViewModel(userActiveSession) : null
    }

    async get(id: string): Promise<UserActiveSessionViewModelType | never> {
        const entity = await UserActiveSessionModel.findOne({_id: id});
        if (!entity) throw new EntityNotFound(`User Active Session with ID: ${id} is not exists`)
        return mapUserActiveSessionToViewModel(entity)
    }

    async findByUserId(userId: string) {
        const activeSessions = await UserActiveSessionModel.find({userId: userId}).lean()
        return activeSessions.map(mapUserActiveSessionToViewModel)
    }
}

export const usersActiveSessionsQueryRepository = new UsersActiveSessionsQueryRepository()
