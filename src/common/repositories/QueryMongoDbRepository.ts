import {Collection, Db, Document} from "mongodb";
import {EntityNotFound} from "../exceptions/EntityNotFound";

export class QueryMongoDbRepository<T extends Document, V> {

    public collection: Collection<T>;
    private mapEntityToViewModel: Function;
    private readonly collectionName: string;

    constructor(dbConnection: Db, collectionName: string, mapper: Function) {
        this.collection = dbConnection.collection<T>(collectionName);
        this.mapEntityToViewModel = mapper;
        this.collectionName = collectionName
    }

    async find(id: string): Promise<V | null> {
        // @ts-ignore
        const entity = await this.collection.findOne({_id: id});
        return entity ? this.mapEntityToViewModel(entity) : null
    }

    async get(id: string): Promise<V | never> {
        // @ts-ignore
        const entity = await this.collection.findOne({_id: id});
        if (!entity) throw new EntityNotFound(`${this.collectionName} with ID: ${id} is not exists`)
        return this.mapEntityToViewModel(entity)
    }
}
