import { AsyncTaskRunner } from "../../core/asyncTask/AsyncTaskRunner";
import { provideDir, saveFile } from "../../utils/FileSave";
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

    for (const task of tasks) {
        const errors: any[] = [];
        const stats = getEmptyProvideOfferStats();

        const updateService = new OfertaUpdateService(task.dataProvider, env, stats);
        await updateService.buildCache();

        await AsyncTaskRunner<IProvideOfferTaskProps>([task], {
            concurency: 10,
            props: { stats, env, updateService }
        }, errors)
            .then(() => taskLogger({ errors, task, date, stats }))
            .catch(err => taskLogger({ err, errors, task, date, stats }));

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