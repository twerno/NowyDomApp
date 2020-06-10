import { saveFile } from "./utils/FileSave";
import { run } from './dataProvider/DataProviderRunner';
import { NovumDataProvider } from './inwestycje/Novum/NovumDataProvider';

console.log('start');

run(NovumDataProvider)
    .then(result => {
        saveFile('test.txt', JSON.stringify(result) + '\n');
        return result;
    })
    .then(result => console.log('end', result.errors?.length > 0 ? result.errors : 'bez błędów'))
    .catch(console.error);
