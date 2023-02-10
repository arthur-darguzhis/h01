import {Document} from "mongodb";
import {EntityNotFound} from "../exceptions/EntityNotFound";
import mongoose from "mongoose";

export class QueryMongoDbRepository<T extends Document, V> {

    public model: mongoose.Model<T>;
    private mapEntityToViewModel: Function;
    private readonly entityName: string;

    constructor(model: mongoose.Model<T>, mapper: Function, entityName: string) {
        this.model = model;
        this.mapEntityToViewModel = mapper;
        this.entityName = entityName;
    }

    async find(id: string): Promise<V | null> {
        const entity = await this.model.findOne({_id: id});
        return entity ? this.mapEntityToViewModel(entity) : null
    }

    async get(id: string): Promise<V | never> {
        const entity = await this.model.findOne({_id: id});
        if (!entity) throw new EntityNotFound(`${this.entityName} with ID: ${id} is not exists`)
        return this.mapEntityToViewModel(entity)
    }
}
