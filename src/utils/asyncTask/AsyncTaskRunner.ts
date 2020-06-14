import { IAsyncTask } from "./IAsyncTask";
import TaskHelper from "../../dataProvider/TaskHelper";

export interface IAsyncTaskRunnerConfig {
    concurency?: number;
}

export const AsyncTaskRunner = async (tasks: IAsyncTask[], config?: IAsyncTaskRunnerConfig, errors?: any[]) => {

    return new Promise<void>((resolve, reject) => {

        let runningTasks: number = 0;

        if (!tasks || tasks.length === 0) {
            reject('brak tasków');
        }

        const getNextTask = (): IAsyncTask | null => {
            let nextTask: IAsyncTask | null = null;
            let nextTaskIdx = -1;

            tasks.reverse().forEach((task, idx) => {
                if ((task.priority || 0) > (nextTask?.priority || -1)) {
                    nextTask = task;
                    nextTaskIdx = idx;
                }
            });

            if (nextTaskIdx > -1) {
                tasks.splice(nextTaskIdx, 1);
            }

            return nextTask;
        }

        const runNextTask = async () => {
            if (tasks.length === 0) {
                if (runningTasks === 0) {
                    resolve();
                }
                return;
            }

            const task = getNextTask();
            try {
                runningTasks++;
                console.log('run task', task);
                const result = await task?.run(errors || []) || [];
                tasks.push.apply(tasks, result instanceof Array ? result : [result]);
            }
            catch (err) {
                TaskHelper.silentErrorReporter(errors || [], { method: 'runNextTask', task })(err);
            }
            finally {
                console.log('task finished', task);
                runningTasks--;
                Promise.resolve()
                    .then(runNextTask);
            }
        }

        for (let i = 0; i < (config?.concurency || 5); i++) {
            runNextTask();
        }
    })

}
