import { IAsyncTask } from "./IAsyncTask";
import TaskHelper from "../../dataProvider/TaskHelper";

export interface IAsyncTaskRunnerConfig {
    concurency?: number;
}

export const AsyncTaskRunner = (tasks: IAsyncTask[], config?: IAsyncTaskRunnerConfig, errors?: any[]) => {

    return new Promise<void>((resolve, reject) => {

        let ref = { runningTasks: 0 };

        if (!tasks || tasks.length === 0) {
            reject('brak tasków');
        }

        const taskLimit = config?.concurency || 5;

        runTasks(tasks, taskLimit, ref, errors || [], resolve);
    });

}

function getNextTask(tasks: IAsyncTask[]): IAsyncTask | null {
    let nextTask: IAsyncTask | null = null;
    let nextTaskIdx = -1;

    for (let i = tasks.length - 1; i >= 0; i--) {
        const task = tasks[i];
        if ((task.priority || 0) > (nextTask?.priority || -1)) {
            nextTask = task;
            nextTaskIdx = i;
        }
    }

    if (nextTaskIdx > -1) {
        tasks.splice(nextTaskIdx, 1);
    }

    return nextTask;
}

async function runNextTask(
    tasks: IAsyncTask[],
    ref: { runningTasks: number },
    errors: any[],
    callback: () => void
) {
    const task = getNextTask(tasks);
    try {
        ref.runningTasks++;
        console.log('run task', (task as any)?.__proto__?.constructor?.name);
        console.log(ref.runningTasks, tasks.length);
        const result = await task?.run(errors || []) || [];
        tasks.push.apply(tasks, result instanceof Array ? result : [result]);
    }
    catch (err) {
        TaskHelper.silentErrorReporter(errors || [], { method: 'runNextTask', task })(err);
    }
    finally {
        console.log('task finished', (task as any)?.__proto__?.constructor?.name);
        ref.runningTasks--;
        callback();
    }
}

function runTasks(
    tasks: IAsyncTask[],
    taskLimit: number,
    ref: { runningTasks: number },
    errors: any[],
    callback: () => void
) {
    if (ref.runningTasks >= taskLimit) {
        return;
    }

    if (tasks.length === 0) {
        if (ref.runningTasks === 0) {
            callback();
        }
        return;
    }

    const taskToBeExecuted = Math.min(taskLimit - ref.runningTasks, tasks.length);

    for (let i = 0; i < taskToBeExecuted; i++) {
        runNextTask(tasks, ref, errors, () => runTasks(tasks, taskLimit, ref, errors, callback));
    }

}
