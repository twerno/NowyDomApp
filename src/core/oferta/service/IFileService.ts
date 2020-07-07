import S3Utils from "../../../utils/S3Utils";
import { safeSaveFile } from "../../../utils/FileSave";

export interface IFileService {
    writeFile(path: string, fileName: string, body: any, contentType?: string): Promise<any>;
}

export const s3FileService: IFileService = {
    writeFile: async (path, filename, body, contentType) => S3Utils.putFile(path, filename, body, contentType),
}

export const devFileService: IFileService = {
    ...s3FileService,

    writeFile: async (path, filename, body) => {
        safeSaveFile(`tmp/${path}`, filename, body);
        return undefined;
    }

}