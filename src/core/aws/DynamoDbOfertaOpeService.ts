import { IOfertaOpeService } from "../oferta/service/IOfertaOpeService";
import { safeSaveFile } from "../utils/FileSave";
import { ofertaOpeRepo } from "./repo/OfertaRecordOpeRepo";



export const dynamoDbOfertaOpeService: IOfertaOpeService = {
    save: async recordOpe => ofertaOpeRepo.put(recordOpe),
    getByOfertaId: async (ofertaId) => ofertaOpeRepo.queryByPartitionKey(ofertaId),
    getAll: async () => ofertaOpeRepo.scan(),
    load: async key => ofertaOpeRepo.getOne(key),
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