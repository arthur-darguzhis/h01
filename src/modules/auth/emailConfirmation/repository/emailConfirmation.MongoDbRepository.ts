import {EntityNotFound} from "../../../../common/exceptions/EntityNotFound";
import {EmailConfirmationType} from "../types/EmailConfirmationType";
import {EmailConfirmationModel} from "../model/EmailConfirmationModel";

class EmailConfirmationRepository {
    async add(emailConfirmation: EmailConfirmationType): Promise<EmailConfirmationType> {
        await EmailConfirmationModel.create(emailConfirmation)
        return emailConfirmation
    }

    async find(id: string): Promise<EmailConfirmationType | null> {
        return EmailConfirmationModel.findOne({_id: id});
    }

    async get(id: string): Promise<EmailConfirmationType | never> {
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

    async findByConfirmationCode(code: string): Promise<EmailConfirmationType | null> {
        return EmailConfirmationModel.findOne({confirmationCode: code})
    }

    async getByUserId(userId: string): Promise<EmailConfirmationType | never> {
        const emailConfirmation = await EmailConfirmationModel.findOne({userId: userId})
        if (!emailConfirmation) throw new EntityNotFound(`There is no confirmation code for userId: ${userId}`)
        return emailConfirmation
    }
}

export const emailConfirmationRepository = new EmailConfirmationRepository()
