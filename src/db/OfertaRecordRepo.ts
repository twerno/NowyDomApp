import { DynamoDBRepo } from "../utils/DynamoDBRepo";
import { IOfertaRecord } from "./IOfertaRecord";

export interface IOfertaRepoKey extends
    Pick<IOfertaRecord, 'inwestycjaId'>,
    Partial<Pick<IOfertaRecord, 'id'>> {
}

export const ofertyRepo = new DynamoDBRepo<IOfertaRepoKey, IOfertaRecord>('Oferty', 'inwestycjaId');