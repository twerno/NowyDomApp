import { DynamoDBRepo } from "../../../utils/DynamoDBRepo";
import { IOfertaRecord } from "../model/IOfertaModel";

export interface IOfertaRepoKey extends
    Pick<IOfertaRecord, 'inwestycjaId'>,
    Partial<Pick<IOfertaRecord, 'ofertaId'>> {
}

export const ofertaRepo = new DynamoDBRepo<IOfertaRepoKey, IOfertaRecord>('Oferta', 'inwestycjaId');