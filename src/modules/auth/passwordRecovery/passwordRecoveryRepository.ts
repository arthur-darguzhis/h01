import {PasswordRecovery} from "./types/PasswordRecoveryType";
import {EntityNotFound} from "../../../common/exceptions/EntityNotFound";
import {PasswordRecoveryModel} from "./model/PasswordRecoveryModel";
import {injectable} from "inversify";

@injectable()
export class PasswordRecoveryRepository {
    async add(passwordRecovery: PasswordRecovery): Promise<PasswordRecovery> {
        await PasswordRecoveryModel.create(passwordRecovery)
        return passwordRecovery
    }

    async find(id: string): Promise<PasswordRecovery | null> {
        return PasswordRecoveryModel.findOne({_id: id});
    }

    async get(id: string): Promise<PasswordRecovery | never> {
        const passwordRecovery = await PasswordRecoveryModel.findOne({_id: id});
        if (!passwordRecovery) throw new EntityNotFound(`Password Recovery Code with ID: ${id} is not exists`);
        return passwordRecovery
    }

    async update(id: string, updateFilter: object): Promise<boolean> {
        const result = await PasswordRecoveryModel.updateOne({_id: id}, {$set: updateFilter})
        return result.modifiedCount === 1;
    }

    async delete(id: string): Promise<boolean> {
        const result = await PasswordRecoveryModel.deleteOne({_id: id});
        return result.deletedCount === 1;
    }

    async getByCode(code: string): Promise<PasswordRecovery | never> {
        const passwordRecovery = await PasswordRecoveryModel.findOne({code: code})
        if (!passwordRecovery) throw new EntityNotFound("it's not a password recovery");
        return passwordRecovery;
    }
}
