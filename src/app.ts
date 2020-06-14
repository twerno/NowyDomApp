import ProvideOfferTask1 from './dataProvider/ProvideOfferTask1';
import { NovumDataProvider } from './inwestycje/Novum/NovumDataProvider';
import { OstojaDataProvider } from "./inwestycje/Ostoja/OstojaDataProvider";
import { AsyncTaskRunner } from './utils/asyncTask/AsyncTaskRunner';

console.log('start');

const errors: any[] = [];

AsyncTaskRunner(
    [
        new ProvideOfferTask1(OstojaDataProvider, 1),
        new ProvideOfferTask1(NovumDataProvider, 2),
    ],
    {
        concurency: 10
    }, errors)
    .catch(err => console.error(err, errors))
    .then(v => console.log('done', v));
