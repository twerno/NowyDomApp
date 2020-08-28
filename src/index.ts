// tslint:disable-next-line:no-var-requires
require('module-alias/register');
import { buildExcel } from "./core/oferta/excel/OfferExcelBuilder";
import { devEnv, awsEnv } from "./core/oferta/tasks/IEnv";
import Methods from "./Methods";
import S3Utils from "./utils/S3Utils";
import * as fs from 'fs';
import Utils from "./utils/Utils";

const filename = 'raport.xlsx';

export async function runAllAndBuildRaport() {
    const { summary } = await Methods.runAll(awsEnv);
    const buffer = await buildExcel(devEnv);
    await S3Utils.putFile('', filename, buffer);
    return summary;
}

async function localRunAllAndBuildRaport() {
    const { summary } = await Methods.runAll(awsEnv);
    console.log(JSON.stringify(summary, null, 2));
    const buffer = await buildExcel(devEnv);
    await S3Utils.putFile('', filename, buffer);
    fs.writeFileSync(filename, Buffer.from(buffer));
    Utils.startFile(filename);
    return summary;
}
