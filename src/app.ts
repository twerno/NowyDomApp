// import { run } from './dataProvider/DataProviderRunner';
import { NovumDataProvider } from './inwestycje/Novum/NovumDataProvider';
import { OstojaDataProvider } from "./inwestycje/Ostoja/OstojaDataProvider";
import { saveFile } from "./utils/FileSave";
import { AsyncTaskRunner } from './utils/asyncTask/AsyncTaskRunner';
import ProvideOfferTask1 from './dataProvider/ProvideOfferTask1';

console.log('start');

const errors: any[] = [];

AsyncTaskRunner(
    [
        new ProvideOfferTask1(OstojaDataProvider, 1),
        new ProvideOfferTask1(NovumDataProvider, 2),
    ],
    {}, errors)
    .catch(err => console.error(err, errors))
    .then(v => console.log('done', v));

// run(OstojaDataProvider)
//     .then(result => {
//         saveFile(`${result.dataProvider.inwestycjaId}.txt`, JSON.stringify(result) + '\n');
//         return result;
//     })
//     .then(result => console.log('end', result.errors?.length > 0 ? result.errors : 'bez błędów'))
//     .catch(console.error);

// run(NovumDataProvider)
//     .then(result => {
//         saveFile(`${result.dataProvider.inwestycjaId}.txt`, JSON.stringify(result) + '\n');
//         return result;
//     })
//     .then(result => console.log('end', result.errors?.length > 0 ? result.errors : 'bez błędów'))
//     .catch(console.error);
