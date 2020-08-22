import { AsyncTaskRunner } from "../../core/asyncTask/AsyncTaskRunner";
import { add2Summary, getEmptyProvideOfferStats, IIProvideOfferSummary, IProvideOfferStats } from "./tasks/AbstractZapiszZmianyTask";
import { OfertaUpdateService } from "./tasks/OfertaUpdateService";
import ProvideOfferTask1, { IProvideOfferTaskProps } from "./tasks/ProvideOfferTask1";
import { IEnv } from "./tasks/IEnv";

export default {
    procesInwestycjaSeq,
    saveLogFile
}

async function procesInwestycjaSeq(tasks: ProvideOfferTask1[], env: IEnv) {
    const date = new Date;

    let summary: IIProvideOfferSummary | undefined = undefined;

    for (let i = 0; i < tasks.length; i++) {
        const task = tasks[i];
        const errors: any[] = [];
        const stats = getEmptyProvideOfferStats();
        console.log(`Przetwarzanie "${task.dataProvider.inwestycjaId}" [${i + 1}/${tasks.length}]`);

        const updateService = new OfertaUpdateService(task.dataProvider, env, stats);
        await updateService.buildCache();

        await AsyncTaskRunner<IProvideOfferTaskProps>([task], {
            concurency: 10,
            props: { stats, env, updateService, executionDate: date }
        }, errors)
            .then(() => taskLogger({ errors, task, date, stats, env }))
            .catch(err => taskLogger({ err, errors, task, date, stats, env }));

        await updateService.wyliczIZapiszUsuniete();

        summary = add2Summary(task.dataProvider, stats, errors, summary);
    }

    return { date, summary };
}

interface ITaskLoggerProps {
    err?: any,
    errors: any[],
    task: ProvideOfferTask1<any, any>,
    date: Date,
    stats: IProvideOfferStats,
    env: IEnv,
}

async function taskLogger(props: ITaskLoggerProps) {
    const { err, errors, task, date, stats, env } = props;

    const id = task.dataProvider.developerId + '_' + task.dataProvider.inwestycjaId;

    if (err) {
        saveLogFile(date, `${id}_exception.txt`, { err }, env);
    }

    return saveLogFile(date, `${id}.txt`, { errors, stats }, env);
}

async function saveLogFile(date: Date, filename: string, body: {}, env: IEnv) {
    const textDay = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const textHour = `${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`;
    const path = `runs/${textDay}/${textHour}`;

    return env.fileService.writeFile(path, filename, JSON.stringify(body, null, 2));
}