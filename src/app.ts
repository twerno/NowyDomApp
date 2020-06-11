import { run } from './dataProvider/DataProviderRunner';
import { NovumDataProvider } from './inwestycje/Novum/NovumDataProvider';
import { OstojaDataProvider } from "./inwestycje/Ostoja/OstojaDataProvider";
import { saveFile } from "./utils/FileSave";

console.log('start');

run(OstojaDataProvider)
    .then(result => {
        saveFile(`${result.dataProvider.inwestycjaId}.txt`, JSON.stringify(result) + '\n');
        return result;
    })
    .then(result => console.log('end', result.errors?.length > 0 ? result.errors : 'bez błędów'))
    .catch(console.error);

run(NovumDataProvider)
    .then(result => {
        saveFile(`${result.dataProvider.inwestycjaId}.txt`, JSON.stringify(result) + '\n');
        return result;
    })
    .then(result => console.log('end', result.errors?.length > 0 ? result.errors : 'bez błędów'))
    .catch(console.error);
