import { IOfertaRecordOpe } from "../model/IOfertaModel";
import { IOfertaRecordOpeKey } from "../../aws/repo/OfertaRecordOpeRepo";
import { safeSaveFile } from "../../utils/FileSave";
import { dynamoDbOfertaOpeService } from "@src/core/aws/DynamoDbOfertaOpeService";
import { IOfertaStateService } from "./IOfertaStateService";
import { IOfertaRepoKey } from "@src/core/aws/repo/OfertaRecordRepo";

export interface IOfertaOpeService {
    getByOfertaId(ofertaId: string): Promise<IOfertaRecordOpe[]>,
    save(record: IOfertaRecordOpe): Promise<any>;
    getAll(): Promise<IOfertaRecordOpe[]>;
    load(key: IOfertaRecordOpeKey): Promise<IOfertaRecordOpe | undefined>
}

export const dummyOfertaOpeService: IOfertaOpeService = {
    save: async (recordOpe) => {
        safeSaveFile(
            `tmp/ope`,
            `${recordOpe.ofertaId}-${recordOpe.version}`,
            JSON.stringify(recordOpe, (_, v) => v === undefined ? null : v, 2)
        );
        return undefined;
    },
    getByOfertaId: async (ofertaId) => [],
    getAll: async () => [],
    load: async key => undefined,
}