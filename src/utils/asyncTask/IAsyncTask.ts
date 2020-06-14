export interface IAsyncTask {

    priority?: number;

    run(errors: any[]): Promise<IAsyncTask | IAsyncTask[]>
}