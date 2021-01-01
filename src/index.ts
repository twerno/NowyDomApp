// tslint:disable-next-line:no-var-requires
require('module-alias/register');
import { buildExcel } from "./core/excel/OfferExcelBuilder";
import Methods from "./Methods";
import S3Utils from "./core/aws/S3Utils";
import * as fs from 'fs';
import Utils from "./core/utils/Utils";
import { awsEnv, devEnv } from "./config/env";

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
    await localBuildRaport();
    return summary;
}

async function localBuildRaport() {
    const buffer = await buildExcel(devEnv);
    // await S3Utils.putFile('', filename, buffer);
    fs.writeFileSync(filename, Buffer.from(buffer));
    Utils.startFile(filename);
}

