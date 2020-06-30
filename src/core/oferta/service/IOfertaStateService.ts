import { IOfertaRecord } from "../model/IOfertaModel";
import { IOfertaRepoKey, ofertaRepo } from "../repo/OfertaRecordRepo";
import { safeSaveFile } from "../../../utils/FileSave";

export interface IOfertaStateService<T> {
    getOne(key: T): Promise<IOfertaRecord | undefined>,
    load(inwestycja: string): Promise<IOfertaRecord[]>,
    save(record: IOfertaRecord): Promise<any>,
    getAll(): Promise<IOfertaRecord[]>
}

export const dynamoDbOfertaStateService: IOfertaStateService<IOfertaRepoKey> = {
    save: (record) => ofertaRepo.put(record),
    load: (partitionKey) => ofertaRepo.queryByPartitionKey(partitionKey),
    getOne: (key) => ofertaRepo.getOne(key),
    getAll: () => ofertaRepo.scan(),
};

export const devOfertaStateService: IOfertaStateService<IOfertaRepoKey> = {
    ...dynamoDbOfertaStateService,

    save: (record) => {
        safeSaveFile(`dev/${record.inwestycjaId}`, record.ofertaId, JSON.stringify(record, null, 2));
        return Promise.resolve();
    }
};