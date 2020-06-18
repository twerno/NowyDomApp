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
import { saveFile, provideDir } from './utils/FileSave';
import { getEmptyProvideOfferStats, IProvideOfferStats } from './dataProvider/AbstractZapiszZmianyTask';

console.log('start');

const tasks = [
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
    const date = new Date;

    for (const task of tasks) {
        const errors: any[] = [];
        const stats = getEmptyProvideOfferStats();
        await AsyncTaskRunner([task], {
            concurency: 10,
            props: stats
        }, errors)
            .catch(err => taskLogger({ err, errors, task, date, stats }))
            .then(() => taskLogger({ errors, task, date, stats }));
    }
}

runTasksSeq()
    .then(v => console.log('done'))
    .catch(err => console.error(err));

interface ITaskLoggerProps {
    err?: any,
    errors: any[],
    task: ProvideOfferTask1<any, any>,
    date: Date,
    stats: IProvideOfferStats
}

function taskLogger(props: ITaskLoggerProps) {

    const { err, errors, task, date, stats } = props;


    const textDay = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const textHour = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    const path = `runs/${textDay}/${textHour}`;

    const id = task.dataProvider.developerId + '_' + task.dataProvider.inwestycjaId;

    provideDir(path);

    if (err) {
        saveFile(`${path}/${id}_exception.txt`, JSON.stringify(err, null, 2));
    }

    saveFile(`${path}/${id}.txt`, JSON.stringify({ errors, stats }, null, 2));
}