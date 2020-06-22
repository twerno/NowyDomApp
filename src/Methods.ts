import { IDataProvider } from 'dataProvider/IOfertaProvider';
import { add2Summary, getEmptyProvideOfferStats, IIProvideOfferSummary, IProvideOfferStats } from './dataProvider/AbstractZapiszZmianyTask';
import ProvideOfferTask1 from './dataProvider/ProvideOfferTask1';
import { GarvenaPark } from './inwestycje/Garvena/GarvenaPark';
import { NovumDataProvider } from './inwestycje/Novum/NovumDataProvider';
import { OstojaDataProvider } from './inwestycje/Ostoja/OstojaDataProvider';
import SemekoAquasfera from './inwestycje/Semeko/SemekoAquasfera';
import SemekoCubic from './inwestycje/Semeko/SemekoCubic';
import SemekoHoryzonty from './inwestycje/Semeko/SemekoHoryzonty';
import SemekoLightTower from './inwestycje/Semeko/SemekoLightTower';
import SemekoOsiedleMarine from './inwestycje/Semeko/SemekoOsiedleMarine';
import SemekoPortoBianco3 from './inwestycje/Semeko/SemekoPortoBianco3';
import SemekoPrimaReda from './inwestycje/Semeko/SemekoPrimaReda';
import SemekoZielonaLaguna2 from './inwestycje/Semeko/SemekoZielonaLaguna2';
import { AsyncTaskRunner } from './utils/asyncTask/AsyncTaskRunner';
import { provideDir, saveFile } from './utils/FileSave';

const allTasks: ProvideOfferTask1<any, any>[] = [
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
    new ProvideOfferTask1(GarvenaPark)
];


export default {
    runOne,
    runAll
}

async function runOne(task: string | IDataProvider<any, any>) {
    const tasks = typeof task === 'string'
        ? allTasks.filter(t => t.dataProvider.inwestycjaId === task)
        : [new ProvideOfferTask1(task)];

    const { date, summary } = await runTasksSeq(tasks);
    saveLogFile(date, 'summary.txt', { summary });
    console.log(JSON.stringify(summary, null, 2));
}

async function runAll() {
    const { date, summary } = await runTasksSeq(allTasks);
    saveLogFile(date, 'summary.txt', { summary });
    console.log(JSON.stringify(summary, null, 2));
}


async function runTasksSeq(tasks: ProvideOfferTask1[]) {
    const date = new Date;

    let summary: IIProvideOfferSummary | undefined = undefined;

    for (const task of tasks) {
        const errors: any[] = [];
        const stats = getEmptyProvideOfferStats();
        await AsyncTaskRunner([task], {
            concurency: 10,
            props: stats
        }, errors)
            .then(() => taskLogger({ errors, task, date, stats }))
            .catch(err => taskLogger({ err, errors, task, date, stats }));

        summary = add2Summary(task.dataProvider, stats, errors, summary);
    }

    return { date, summary };
}

interface ITaskLoggerProps {
    err?: any,
    errors: any[],
    task: ProvideOfferTask1<any, any>,
    date: Date,
    stats: IProvideOfferStats
}

function taskLogger(props: ITaskLoggerProps) {
    const { err, errors, task, date, stats } = props;

    const id = task.dataProvider.developerId + '_' + task.dataProvider.inwestycjaId;

    if (err) {
        saveLogFile(date, `${id}_exception.txt`, { err });
    }

    saveLogFile(date, `${id}.txt`, { errors, stats });
}

function saveLogFile(date: Date, filename: string, body: {}) {
    const textDay = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const textHour = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    const path = `runs/${textDay}/${textHour}`;

    provideDir(path);

    saveFile(`${path}/${filename}`, JSON.stringify(body, null, 2));
}