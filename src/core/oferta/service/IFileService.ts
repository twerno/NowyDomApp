import S3Utils from "../../../utils/S3Utils";
import { safeSaveFile } from "../../../utils/FileSave";

export interface IFileService {
    writeFile(path: string, fileName: string, body: any, contentType?: string): Promise<any>;
}

export const s3FileService: IFileService = {
    writeFile: (path, filename, body, contentType) => S3Utils.putFile(path, filename, body, contentType),
}

export const devFileService: IFileService = {
    ...s3FileService,
    writeFile: (path, filename, body) => {
        safeSaveFile(`dev/${path}/files`, filename, body);
        return Promise.resolve();
    }

}