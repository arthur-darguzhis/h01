import {CommandMongoDbRepository} from "../../../common/repositories/CommandMongoDbRepository";
import {PasswordRecoveryType} from "./types/PasswordRecoveryType";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";
import {PasswordRecoveryModel} from "./model/PasswordRecoveryModel";

class PasswordRecoveryRepository extends CommandMongoDbRepository<PasswordRecoveryType, object> {
    async getByCode(code: string): Promise<PasswordRecoveryType | never> {
        const passwordRecovery = await this.model.findOne({code: code})
        if (!passwordRecovery) throw new EntityNotFound("it's not a password recovery");
        return passwordRecovery;
    }
}

export const passwordRecoveryRepository = new PasswordRecoveryRepository(PasswordRecoveryModel, 'Password Recovery Code');
