import { IDataProvider } from './core/oferta/IOfertaProvider';
import { inwestycje } from './inwestycje/inwestycje';
import InwestycjaDataProviderTaskRunner from './core/oferta/InwestycjaDataProviderTaskRunner';
import ProvideOfferTask1 from './core/oferta/tasks/ProvideOfferTask1';
import { IIProvideOfferSummary } from './core/oferta/tasks/AbstractZapiszZmianyTask';
import { IEnv } from './core/oferta/tasks/IEnv';

export default {
    runOne,
    runAll
}

async function runOne(task: string | IDataProvider<any, any>, env: IEnv) {
    const tasks = typeof task === 'string'
        ? inwestycje.filter(inwestycja => inwestycja.inwestycjaId === task)
            .map(inwestycja => new ProvideOfferTask1(inwestycja))
        : [new ProvideOfferTask1(task)];


    const { date, summary } = await InwestycjaDataProviderTaskRunner.procesInwestycjaSeq(tasks, env);

    saveTaskStatus(date, summary, env);

    return { date, summary };
}

async function runAll(env: IEnv) {
    const tasks = inwestycje
        .map(inwestycja => new ProvideOfferTask1(inwestycja));

    const sortedTasks = tasks.sort(() => Math.random() - 0.5);

    const { date, summary } = await InwestycjaDataProviderTaskRunner.procesInwestycjaSeq(sortedTasks, env);

    saveTaskStatus(date, summary, env);

    return { date, summary };
}

function saveTaskStatus(date: Date, summary: IIProvideOfferSummary | undefined, env: IEnv) {
    InwestycjaDataProviderTaskRunner.saveLogFile(date, 'summary.txt', { summary }, env);
}

