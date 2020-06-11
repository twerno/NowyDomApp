import { saveFile } from "./utils/FileSave";
import { run } from './dataProvider/DataProviderRunner';
import { NovumDataProvider } from './inwestycje/Novum/NovumDataProvider';
import { OstojaDataProvider } from "./inwestycje/Ostoja/OstojaDataProvider";
import Axios from "axios";
import { extension } from 'mime-types';
import S3Utils from "./utils/S3Utils";

console.log('start');

async function test() {
    // const result = await Axios({ responseType: 'arraybuffer', url: 'https://www.inpro.com.pl/download-pdf/4263' });
    const result = await Axios({ responseType: 'arraybuffer', url: 'https://novumrumia.pl/wp-content/uploads/2020/06/B4-M12-1.pdf' });

    const contentType = result.headers['content-type'];
    const attachmentName = /filename="(.+)"/.exec(result.headers['content-disposition']) || [];
    const filename = attachmentName[1] || `card.${extension(contentType)}`;
    console.log(result);
    await S3Utils.putFile('test', 'test', filename, result.data);
}

test().catch(console.error);


// run(OstojaDataProvider)
//     .then(result => {
//         saveFile('test.txt', JSON.stringify(result) + '\n');
//         return result;
//     })
//     .then(result => console.log('end', result.errors?.length > 0 ? result.errors : 'bez błędów'))
//     .catch(console.error);
