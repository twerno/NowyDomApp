import ProvideOfferTask1 from './dataProvider/ProvideOfferTask1';
import { NovumDataProvider } from './inwestycje/Novum/NovumDataProvider';
import { OstojaDataProvider } from './inwestycje/Ostoja/OstojaDataProvider';
import SemekoAquasfera from './inwestycje/Semeko/SemekoAquasfera';
import { AsyncTaskRunner } from './utils/asyncTask/AsyncTaskRunner';
import SemekoCubic from './inwestycje/Semeko/SemekoCubic';
import SemekoHoryzonty from './inwestycje/Semeko/SemekoHoryzonty';
import SemekoLightTower from './inwestycje/Semeko/SemekoLightTower';
import SemekoOsiedleMarine from './inwestycje/Semeko/SemekoOsiedleMarine';
import SemekoPortoBianco3 from './inwestycje/Semeko/SemekoPortoBianco3';
import SemekoPrimaReda from './inwestycje/Semeko/SemekoPrimaReda';
import SemekoZielonaLaguna2 from './inwestycje/Semeko/SemekoZielonaLaguna2';
import { IAsyncTask } from 'utils/asyncTask/IAsyncTask';

console.log('start');

const tasks: IAsyncTask[] = [
    new ProvideOfferTask1(OstojaDataProvider),
    new ProvideOfferTask1(NovumDataProvider),
    new ProvideOfferTask1(SemekoAquasfera),
    new ProvideOfferTask1(SemekoCubic),
    new ProvideOfferTask1(SemekoHoryzonty),
    new ProvideOfferTask1(SemekoLightTower),
    new ProvideOfferTask1(SemekoOsiedleMarine),
    new ProvideOfferTask1(SemekoPortoBianco3),
    new ProvideOfferTask1(SemekoPrimaReda),
    new ProvideOfferTask1(SemekoZielonaLaguna2),
];

async function runTasksSeq() {

    for (const task of tasks) {
        const errors: any[] = [];
        await AsyncTaskRunner([task], {
            concurency: 10,
        }, errors)
            .catch(err => console.error(err, errors, task))
            .then(v => console.log('done', task, JSON.stringify(errors)));
    }
}

runTasksSeq()
    .then(v => console.log('done'))
    .catch(err => console.error(err));
