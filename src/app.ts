import { saveFile } from "./utils/FileSave";
import { run } from './dataProvider/DataProviderRunner';
import { NovumDataProvider } from './inwestycje/Novum/NovumDataProvider';

console.log('start');

run(NovumDataProvider)
    .then(result => saveFile('test.txt', JSON.stringify(result) + '\n'))
    .then(() => console.log('end'))
    .catch(console.error);
