import { DynamoDBRepo } from "../DynamoDBRepo";
import { IOfertaRecord } from "../../oferta/model/IOfertaModel";
import awsConfig from "@src/config/awsConfig";

export interface IOfertaRepoKey extends
    Pick<IOfertaRecord, 'inwestycjaId'>,
    Partial<Pick<IOfertaRecord, 'ofertaId'>> {
}

export const ofertaRepo = new DynamoDBRepo<IOfertaRepoKey, IOfertaRecord>(
    awsConfig.dynamoDB.ofertaStan.name,
    awsConfig.dynamoDB.ofertaStan.key,
);

