import { safeSaveFile } from "@src/core/utils/FileSave";
import { IFileService } from "../oferta/service/IFileService";
import S3Utils from "./S3Utils";

export const s3FileService: IFileService = {
    writeFile: async (path, filename, body, contentType) =>
        S3Utils.putFile(path, filename, typeof body === 'string' ? body : JSON.stringify(body), contentType),
}

