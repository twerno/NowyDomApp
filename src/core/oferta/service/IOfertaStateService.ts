import { IOfertaRecord } from "../model/IOfertaModel";
import { IOfertaRepoKey, ofertaRepo } from "../repo/OfertaRecordRepo";
import { safeSaveFile } from "../../../utils/FileSave";

export interface IOfertaStateService<T> {
    getOne(key: T): Promise<IOfertaRecord | undefined>,
    getByInwestycja(inwestycja: string): Promise<IOfertaRecord[]>,
    save(record: IOfertaRecord): Promise<any>,
    getAll(): Promise<IOfertaRecord[]>
}

export const dynamoDbOfertaStateService: IOfertaStateService<IOfertaRepoKey> = {
    save: async (record) => ofertaRepo.put(record),
    getByInwestycja: async (partitionKey) => ofertaRepo.queryByPartitionKey(partitionKey),
    getOne: async (key) => ofertaRepo.getOne(key),
    getAll: async () => ofertaRepo.scan(),
};

export const devOfertaStateService: IOfertaStateService<IOfertaRepoKey> = {
    ...dynamoDbOfertaStateService,

    save: async (record) => {
        safeSaveFile(`dev/${record.inwestycjaId}`, record.ofertaId, JSON.stringify(record, null, 2));
        return Promise.resolve();
    }
};