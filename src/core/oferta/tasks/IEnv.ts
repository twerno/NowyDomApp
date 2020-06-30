import { IOfertaStateService, dynamoDbOfertaStateService, devOfertaStateService } from "../service/IOfertaStateService";
import { IOfertaRepoKey } from "../repo/OfertaRecordRepo";
import { IOfertaOpeService, dynamoDbOfertaOpeService, devOfertaOpeService } from "../service/IOfertaOpeService";
import { IFileService, s3FileService, devFileService } from "../service/IFileService";

export interface IEnv {
    readonly stanService: IOfertaStateService<IOfertaRepoKey>,
    readonly opeService: IOfertaOpeService,
    readonly fileService: IFileService,
}

export const prodEnv: IEnv = {
    stanService: dynamoDbOfertaStateService,
    opeService: dynamoDbOfertaOpeService,
    fileService: s3FileService,
}

export const devEnv: IEnv = {
    stanService: devOfertaStateService,
    opeService: devOfertaOpeService,
    fileService: devFileService,
}