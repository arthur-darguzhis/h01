import {CommandMongoDbRepository} from "../../common/repositories/CommandMongoDbRepository";
import {PasswordRecoveryType} from "./types/PasswordRecoveryType";
import {dbConnection} from "../../db";
import {EntityNotFound} from "../../common/exceptions/EntityNotFound";

class PasswordRecoveryRepository extends CommandMongoDbRepository<PasswordRecoveryType, object> {
    async getByCode(code: string): Promise<PasswordRecoveryType | never> {
        const passwordRecovery = await this.collection.findOne({code: code})
        if (!passwordRecovery) throw new EntityNotFound("it's not a password recovery");
        return passwordRecovery;
    }
}

export const passwordRecoveryRepository = new PasswordRecoveryRepository(dbConnection, 'passwordRevoveryCodes');
