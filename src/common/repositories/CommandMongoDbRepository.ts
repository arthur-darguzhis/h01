import {Document} from "mongodb";
import {EntityNotFound} from "../exceptions/EntityNotFound";
import mongoose from "mongoose";

export class CommandMongoDbRepository<T extends Document, U> {

    public readonly model: mongoose.Model<T>;
    private readonly entityName: string;

    constructor(model: mongoose.Model<T>, entityName: string) {
        this.model = model
        this.entityName = entityName;
    }

    async add(newEntity: T): Promise<T> {
        await this.model.create(newEntity)
        return newEntity
    }

    async isExists(id: string): Promise<boolean> {
        const entity = await this.model.findOne({_id: id})
        return !!entity;
    }

    async find(id: string): Promise<T | null> {
        return this.model.findOne({_id: id});
    }

    async get(id: string): Promise<T | never> {
        const entity = await this.model.findOne({_id: id});
        if(!entity) throw new EntityNotFound(`${this.entityName} with ID: ${id} is not exists`);
        return entity
    }

    async update(id: string, updateFilter: object): Promise<boolean> {
        const result = await this.model.updateOne({_id: id}, {$set: updateFilter})
        return result.modifiedCount === 1;
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.model.deleteOne({_id: id});
        return result.deletedCount === 1;
    }
}
