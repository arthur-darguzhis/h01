import {UserActiveSessionViewModelType} from "../types/UserActiveSessionViewModelType";
import {mapUserActiveSessionToViewModel} from "../userActiveSession.mapper";
import {UserActiveSessionModel} from "../model/UserActiveSessionModel";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";
import {injectable} from "inversify";

@injectable()
export class UsersActiveSessionsQueryRepository {
    async find(id: string): Promise<UserActiveSessionViewModelType | null> {
        const userActiveSession = await UserActiveSessionModel.findOne({_id: id});
        return userActiveSession ? mapUserActiveSessionToViewModel(userActiveSession) : null
    }

    async get(id: string): Promise<UserActiveSessionViewModelType | never> {
        const userActiveSession = await UserActiveSessionModel.findOne({_id: id});
        if (!userActiveSession) throw new EntityNotFound(`User Active Session with ID: ${id} is not exists`)
        return mapUserActiveSessionToViewModel(userActiveSession)
    }

    async findByUserId(userId: string) {
        const activeSessions = await UserActiveSessionModel.find({userId: userId}).lean()
        return activeSessions.map(mapUserActiveSessionToViewModel)
    }
}
