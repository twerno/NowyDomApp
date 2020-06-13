import { IAsyncTask } from "./IAsyncTask";

export interface IAsyncTaskRunnerConfig {
    concurency?: number;
}

export const AsyncTaskRunner = async (tasks: IAsyncTask[], config?: IAsyncTaskRunnerConfig, errors?: any[]) => {

    if (!tasks || tasks.length === 0) {
        return null;
    }

    const runNextTask = async () => {
        if (!tasks || tasks.length === 0) {
            return;
        }
        const task = tasks.pop();
        const result = await task?.run(errors || []) || [];
        tasks.push.apply(tasks, result instanceof Array ? result : [result]);
        await runNextTask();
    }

    for (let i = 0; i < (config?.concurency || 5); i++) {
        runNextTask();
    }

}
