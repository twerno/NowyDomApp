import { IOfertaStateService } from "../service/IOfertaStateService";
import { IOfertaRepoKey } from "../../aws/repo/OfertaRecordRepo";
import { IOfertaOpeService } from "../service/IOfertaOpeService";
import { IFileService } from "../service/IFileService";


export interface IEnv {
    readonly stanService: IOfertaStateService<IOfertaRepoKey>,
    readonly opeService: IOfertaOpeService,
    readonly fileService: IFileService,
}

