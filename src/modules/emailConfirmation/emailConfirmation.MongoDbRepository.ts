import {dbConnection} from "../../db";
import {EntityNotFound} from "../../common/exceptions/EntityNotFound";
import {EmailConfirmationType} from "./types/EmailConfirmationType";
import {CommandMongoDbRepository} from "../../common/repositories/CommandMongoDbRepository";

class EmailConfirmationRepository extends CommandMongoDbRepository<EmailConfirmationType, object> {

    async findByConfirmationCode(code: string): Promise<EmailConfirmationType | null> {
        return await this.collection.findOne({confirmationCode: code})
    }

    async getByConfirmationCode(code: string): Promise<EmailConfirmationType | never> {
        const emailConfirmation = await this.collection.findOne({confirmationCode: code})
        if (!emailConfirmation) throw new EntityNotFound(`Confirmation code: ${code} is not exists`)
        return emailConfirmation
    }

    async getByUserId(userId: string): Promise<EmailConfirmationType | never> {
        const emailConfirmation = await this.collection.findOne({userId: userId})
        if (!emailConfirmation) throw new EntityNotFound(`There is no confirmation code for userId: ${userId}`)
        return emailConfirmation
    }
}

export const emailConfirmationRepository = new EmailConfirmationRepository(dbConnection, 'emailConfirmation')
