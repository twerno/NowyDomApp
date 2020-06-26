import { IOfertaRecordOpe } from "../model/IOfertaModel";
import { DynamoDBRepo } from "../../../utils/DynamoDBRepo";

export interface IOfertaRecordOpeKey extends
    Pick<IOfertaRecordOpe, 'ofertaId'>,
    Partial<Pick<IOfertaRecordOpe, 'version'>> {
}

export const ofertaOpeRepo = new DynamoDBRepo<IOfertaRecordOpeKey, IOfertaRecordOpe>('OfertaOpe', 'ofertaId');