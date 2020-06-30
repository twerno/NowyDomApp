import { IOfertaRecordOpe } from "../model/IOfertaModel";
import { ofertaOpeRepo } from "../repo/OfertaRecordOpeRepo";
import { safeSaveFile } from "../../../utils/FileSave";

export interface IOfertaOpeService {
    save(record: IOfertaRecordOpe): Promise<any>
}

export const dynamoDbOfertaOpeService: IOfertaOpeService = {
    save: async (recordOpe) => ofertaOpeRepo.put(recordOpe),
};

export const devOfertaOpeService: IOfertaOpeService = {
    ...dynamoDbOfertaOpeService,

    save: (recordOpe) => {
        safeSaveFile(`dev/ope`, `${recordOpe.ofertaId}-${recordOpe.version}`, JSON.stringify(recordOpe, null, 2));
        return Promise.resolve();
    },
};