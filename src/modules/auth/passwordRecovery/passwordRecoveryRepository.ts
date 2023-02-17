import {PasswordRecoveryType} from "./types/PasswordRecoveryType";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";
import {PasswordRecoveryModel} from "./model/PasswordRecoveryModel";

class PasswordRecoveryRepository {
    async add(passwordRecovery: PasswordRecoveryType): Promise<PasswordRecoveryType> {
        await PasswordRecoveryModel.create(passwordRecovery)
        return passwordRecovery
    }

    async find(id: string): Promise<PasswordRecoveryType | null> {
        return PasswordRecoveryModel.findOne({_id: id});
    }

    async get(id: string): Promise<PasswordRecoveryType | never> {
        const entity = await PasswordRecoveryModel.findOne({_id: id});
        if (!entity) throw new EntityNotFound(`Password Recovery Code with ID: ${id} is not exists`);
        return entity
    }

    async update(id: string, updateFilter: object): Promise<boolean> {
        const result = await PasswordRecoveryModel.updateOne({_id: id}, {$set: updateFilter})
        return result.modifiedCount === 1;
    }

    async delete(id: string): Promise<boolean> {
        const result = await PasswordRecoveryModel.deleteOne({_id: id});
        return result.deletedCount === 1;
    }

    async getByCode(code: string): Promise<PasswordRecoveryType | never> {
        const passwordRecovery = await PasswordRecoveryModel.findOne({code: code})
        if (!passwordRecovery) throw new EntityNotFound("it's not a password recovery");
        return passwordRecovery;
    }
}

export const passwordRecoveryRepository = new PasswordRecoveryRepository();
