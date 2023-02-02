import {emailConfirmationCollection} from "../../db";
import {EntityNotFound} from "../../domain/exceptions/EntityNotFound";
import {EmailConfirmationType} from "./types/EmailConfirmationType";

export const emailConfirmationRepository = {

    async getConfirmationByCode(code: string): Promise<EmailConfirmationType | never> {
        const emailConfirmation = await emailConfirmationCollection.findOne({confirmationCode: code})
        if (emailConfirmation === null) throw new EntityNotFound(`Confirmation code ${code} is not exists`)
        return emailConfirmation
    },

    async getConfirmationByUserId(userId: string): Promise<EmailConfirmationType | never> {
        const emailConfirmation = await emailConfirmationCollection.findOne({userId: userId})
        if (emailConfirmation === null) throw new EntityNotFound(`There is no confirmation code for userId: ${userId}`)
        return emailConfirmation
    },

    async update(id: string, updateFilter: object): Promise<boolean> {
        const result = await emailConfirmationCollection.updateOne({_id: id}, {$set: updateFilter})
        return result.matchedCount === 1;
    },

    async addEmailConfirmation(emailConfirmation: EmailConfirmationType): Promise<EmailConfirmationType> {
        await emailConfirmationCollection.insertOne(emailConfirmation);
        return emailConfirmation;
    }
}
