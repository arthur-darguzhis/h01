import {EntityNotFound} from "../../../../common/exceptions/EntityNotFound";
import {EmailConfirmation} from "../types/EmailConfirmation";
import {EmailConfirmationModel} from "../model/EmailConfirmationModel";
import {injectable} from "inversify";

@injectable()
export class EmailConfirmationRepository {
    async add(emailConfirmation: EmailConfirmation): Promise<EmailConfirmation> {
        await EmailConfirmationModel.create(emailConfirmation)
        return emailConfirmation
    }

    async find(id: string): Promise<EmailConfirmation | null> {
        return EmailConfirmationModel.findOne({_id: id});
    }

    async get(id: string): Promise<EmailConfirmation | never> {
        const emailConfirmation = await EmailConfirmationModel.findOne({_id: id});
        if (!emailConfirmation) throw new EntityNotFound(`Email confirmation with ID: ${id} is not exists`);
        return emailConfirmation
    }

    async update(id: string, updateFilter: object): Promise<boolean> {
        const result = await EmailConfirmationModel.updateOne({_id: id}, {$set: updateFilter})
        return result.modifiedCount === 1;
    }

    async delete(id: string): Promise<boolean> {
        const result = await EmailConfirmationModel.deleteOne({_id: id});
        return result.deletedCount === 1;
    }

    async findByConfirmationCode(code: string): Promise<EmailConfirmation | null> {
        return EmailConfirmationModel.findOne({confirmationCode: code})
    }

    async getByUserId(userId: string): Promise<EmailConfirmation | never> {
        const emailConfirmation = await EmailConfirmationModel.findOne({userId: userId})
        if (!emailConfirmation) throw new EntityNotFound(`There is no confirmation code for userId: ${userId}`)
        return emailConfirmation
    }
}

export const emailConfirmationRepository = new EmailConfirmationRepository()
