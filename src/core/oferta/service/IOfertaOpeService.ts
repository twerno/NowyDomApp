import { IOfertaRecordOpe } from "../model/IOfertaModel";
import { ofertaOpeRepo } from "../repo/OfertaRecordOpeRepo";
import { safeSaveFile } from "../../../utils/FileSave";

export interface IOfertaOpeService {
    getByOfertaId(ofertaId: string): Promise<IOfertaRecordOpe[]>,
    save(record: IOfertaRecordOpe): Promise<any>
}

export const dynamoDbOfertaOpeService: IOfertaOpeService = {
    save: async (recordOpe) => ofertaOpeRepo.put(recordOpe),
    getByOfertaId: async (ofertaId) => ofertaOpeRepo.queryByPartitionKey(ofertaId)
};

export const devOfertaOpeService: IOfertaOpeService = {
    ...dynamoDbOfertaOpeService,

    save: (recordOpe) => {
        safeSaveFile(`dev/ope`, `${recordOpe.ofertaId}-${recordOpe.version}`, JSON.stringify(recordOpe, null, 2));
        return Promise.resolve();
    },
};