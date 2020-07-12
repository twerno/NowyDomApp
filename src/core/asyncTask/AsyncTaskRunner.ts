import { IAsyncTask } from "./IAsyncTask";
import TaskHelper from "./TaskHelper";

export interface IAsyncTaskRunnerConfig<P> {
    concurency?: number;
    props: P
}

export const AsyncTaskRunner = <P>(tasks: IAsyncTask<P>[], config: IAsyncTaskRunnerConfig<P>, errors?: any[]) => {

    return new Promise<void>((resolve, reject) => {

        let ref = { runningTasks: 0 };

        if (!tasks || tasks.length === 0) {
            reject('brak tasków');
        }

        const taskLimit = config?.concurency || 5;

        const runTasksFn = () => {
            if (tasks.length === 0) {
                if (ref.runningTasks === 0) {
                    resolve();
                }
                return;
            }
            runTasks(tasks, taskLimit, config.props, ref, errors || [], runTasksFn);
        }

        runTasksFn();
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

let taskCount = 0;

async function runNextTask<P>(
    tasks: IAsyncTask[],
    props: P,
    ref: { runningTasks: number },
    errors: any[]
) {
    const task = getNextTask(tasks);
    const taskName = (task as any)?.__proto__?.constructor?.name;
    try {
        ref.runningTasks++;
        if (taskCount++ % 5 === 0) {
            // console.log(`runningTasks: ${ref.runningTasks}`, `pendingTasks: ${tasks.length}`, `errors: ${errors?.length || 0}`, `all: ${taskCount}`);
        }
        const result = await Promise.race([
            task?.run(errors, props),
            new Promise((resolve, reject) => setTimeout(() => reject(`task timeout ${taskName}`), 1000 * 30))
        ]) || [];
        tasks.push.apply(tasks, result instanceof Array ? result : [result]);
    }
    catch (err) {
        console.log(`task error: ${err}`);
        TaskHelper.silentErrorReporter(errors, { method: 'runNextTask', task })(err);
    }
    finally {
        ref.runningTasks--;
    }
}

function runTasks<P>(
    tasks: IAsyncTask[],
    taskLimit: number,
    props: P,
    ref: { runningTasks: number },
    errors: any[],
    runTasksFn: () => void,
) {
    if (ref.runningTasks >= taskLimit) {
        return;
    }

    const taskToBeExecuted = Math.min(taskLimit - ref.runningTasks, tasks.length);

    for (let i = 0; i < taskToBeExecuted; i++) {
        runNextTask(tasks, props, ref, errors)
            .then(runTasksFn);
    }
}
