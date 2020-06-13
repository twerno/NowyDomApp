export interface IAsyncTask {
    run(errors: any[]): Promise<IAsyncTask | IAsyncTask[]>
}