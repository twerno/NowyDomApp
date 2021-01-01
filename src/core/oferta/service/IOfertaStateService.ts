import { IOfertaRecord } from "../model/IOfertaModel";
import { IOfertaRepoKey, ofertaRepo } from "../../aws/repo/OfertaRecordRepo";
import { safeSaveFile } from "../../utils/FileSave";

export interface IOfertaStateService<T> {
    getOne(key: T): Promise<IOfertaRecord | undefined>,
    getByInwestycja(inwestycja: string): Promise<IOfertaRecord[]>,
    save(record: IOfertaRecord): Promise<any>,
    getAll(): Promise<IOfertaRecord[]>
}

