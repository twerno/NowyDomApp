import { IOfertaRecordOpe } from "../model/IOfertaModel";
import { ofertaOpeRepo, IOfertaRecordOpeKey } from "../repo/OfertaRecordOpeRepo";
import { safeSaveFile } from "../../../utils/FileSave";

export interface IOfertaOpeService {
    getByOfertaId(ofertaId: string): Promise<IOfertaRecordOpe[]>,
    save(record: IOfertaRecordOpe): Promise<any>;
    getAll(): Promise<IOfertaRecordOpe[]>;
    load(key: IOfertaRecordOpeKey): Promise<IOfertaRecordOpe | undefined>
}

export const dynamoDbOfertaOpeService: IOfertaOpeService = {
    save: async (recordOpe) => ofertaOpeRepo.put(recordOpe),
    getByOfertaId: async (ofertaId) => ofertaOpeRepo.queryByPartitionKey(ofertaId),
    getAll: async () => ofertaOpeRepo.scan(),
    load: async (key) => ofertaOpeRepo.getOne(key),
};

export const devOfertaOpeService: IOfertaOpeService = {
    ...dynamoDbOfertaOpeService,

    save: async (recordOpe) => {
        safeSaveFile(
            `tmp/ope`,
            `${recordOpe.ofertaId}-${recordOpe.version}`,
            JSON.stringify(recordOpe, (_, v) => v === undefined ? null : v, 2)
        );
        return undefined;
    },
};