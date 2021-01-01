import { IOfertaRecordOpe } from "../model/IOfertaModel";
import { IOfertaRecordOpeKey } from "../../aws/repo/OfertaRecordOpeRepo";
import { safeSaveFile } from "../../utils/FileSave";
import { dynamoDbOfertaOpeService } from "@src/core/aws/DynamoDbOfertaOpeService";

export interface IOfertaOpeService {
    getByOfertaId(ofertaId: string): Promise<IOfertaRecordOpe[]>,
    save(record: IOfertaRecordOpe): Promise<any>;
    getAll(): Promise<IOfertaRecordOpe[]>;
    load(key: IOfertaRecordOpeKey): Promise<IOfertaRecordOpe | undefined>
}
