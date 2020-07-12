import { IOfertaRecordOpe } from "../model/IOfertaModel";
import { ofertaOpeRepo } from "../repo/OfertaRecordOpeRepo";
import { safeSaveFile } from "../../../utils/FileSave";

export interface IOfertaOpeService {
    getByOfertaId(ofertaId: string): Promise<IOfertaRecordOpe[]>,
    save(record: IOfertaRecordOpe): Promise<any>;
    getAll(): Promise<IOfertaRecordOpe[]>;
}

export const dynamoDbOfertaOpeService: IOfertaOpeService = {
    save: async (recordOpe) => ofertaOpeRepo.put(recordOpe),
    getByOfertaId: async (ofertaId) => ofertaOpeRepo.queryByPartitionKey(ofertaId),
    getAll: async () => ofertaOpeRepo.scan()
};

export const devOfertaOpeService: IOfertaOpeService = {
    ...dynamoDbOfertaOpeService,

    save: async (recordOpe) => {
        safeSaveFile(`tmp/ope`, `${recordOpe.ofertaId}-${recordOpe.version}`, JSON.stringify(recordOpe, null, 2));
        return undefined;
    },
};