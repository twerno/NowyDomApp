import { IOfertaRecord } from "../model/IOfertaModel";
import { IOfertaRepoKey, ofertaRepo } from "../../aws/repo/OfertaRecordRepo";
import { safeSaveFile } from "../../utils/FileSave";

export interface IOfertaStateService<T> {
    getOne(key: T): Promise<IOfertaRecord | undefined>,
    getByInwestycja(inwestycja: string): Promise<IOfertaRecord[]>,
    save(record: IOfertaRecord): Promise<any>,
    getAll(): Promise<IOfertaRecord[]>
}

export const dummyOfertaStateService: IOfertaStateService<IOfertaRepoKey> = {
    save: async (record) => {
        safeSaveFile(`tmp/${record.inwestycjaId}`, record.ofertaId, JSON.stringify(record, null, 2));
        return Promise.resolve();
    },
    getByInwestycja: async (partitionKey) => [],
    getOne: async (key) => undefined,
    getAll: async () => [],
};