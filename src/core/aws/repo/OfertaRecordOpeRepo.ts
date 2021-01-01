import awsConfig from "@src/config/awsConfig";
import { IOfertaRecordOpe } from "../../oferta/model/IOfertaModel";
import { DynamoDBRepo } from "../DynamoDBRepo";

export interface IOfertaRecordOpeKey extends
    Pick<IOfertaRecordOpe, 'ofertaId'>,
    Partial<Pick<IOfertaRecordOpe, 'version'>> {
}

export const ofertaOpeRepo = new DynamoDBRepo<IOfertaRecordOpeKey, IOfertaRecordOpe>(
    awsConfig.dynamoDB.ofertaOpe.name,
    awsConfig.dynamoDB.ofertaOpe.key,
);