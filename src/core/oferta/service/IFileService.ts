import S3Utils from "../../aws/S3Utils";
import { safeSaveFile } from "../../utils/FileSave";
import { s3FileService } from "@src/core/aws/S3FileService";

export interface IFileService {
    writeFile(path: string, fileName: string, body: any, contentType?: string): Promise<any>;
}

export const devFileService: IFileService = {

    writeFile: async (path, filename, body) => {
        safeSaveFile(`tmp/${path}`, filename, body);
        return undefined;
    }

}


