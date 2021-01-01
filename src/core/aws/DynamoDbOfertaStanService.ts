import { IOfertaRepoKey, ofertaRepo } from "./repo/OfertaRecordRepo";
import { IOfertaStateService } from "../oferta/service/IOfertaStateService";
import { safeSaveFile } from "../utils/FileSave";

export const dynamoDbOfertaStateService: IOfertaStateService<IOfertaRepoKey> = {
    save: async (record) => ofertaRepo.put(record),
    getByInwestycja: async (partitionKey) => ofertaRepo.queryByPartitionKey(partitionKey),
    getOne: async (key) => ofertaRepo.getOne(key),
    getAll: async () => ofertaRepo.scan(),
};

export const devOfertaStateService: IOfertaStateService<IOfertaRepoKey> = {
    ...dynamoDbOfertaStateService,

    save: async (record) => {
        safeSaveFile(`tmp/${record.inwestycjaId}`, record.ofertaId, JSON.stringify(record, null, 2));
        return Promise.resolve();
    }
};