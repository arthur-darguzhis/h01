import {Collection, Db, Document} from "mongodb";
import {EntityNotFound} from "../exceptions/EntityNotFound";

export class CommandMongoDbRepository<T extends Document, U> {

    public collection: Collection<T>;
    private readonly collectionName: string;

    constructor(dbConnection: Db, collectionName: string) {
        this.collection = dbConnection.collection<T>(collectionName);
        this.collectionName = collectionName
    }

    async add(newEntity: T): Promise<T> {
        // @ts-ignore
        await this.collection.insertOne(newEntity)  //or "newEntity as any"
        return newEntity
    }

    async isExists(id: string): Promise<boolean> {
        // @ts-ignore
        const entity = await this.collection.findOne({_id: id})
        return !!entity;
    }

    async find(id: string): Promise<T | null> {
        // @ts-ignore
        return await this.collection.findOne({_id: id});
    }

    async get(id: string): Promise<T | never> {
        // @ts-ignore
        const entity = await this.collection.findOne({_id: id});
        if(!entity) throw new EntityNotFound(`${this.collectionName} with ID: ${id} is not exists`);
        // @ts-ignore
        return entity
    }

    async update(id: string, updateFilter: U): Promise<boolean> {
        // @ts-ignore
        const result = await this.collection.updateOne({_id: id}, {$set: updateFilter})
        // @ts-ignore
        return result.matchedCount === 1;
    }

    async delete(id: string): Promise<boolean> {
        // @ts-ignore
        const result = await this.collection.deleteOne({_id: id});
        // @ts-ignore
        return result.deletedCount === 1;
    }
}
