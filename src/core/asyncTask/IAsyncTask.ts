export interface IAsyncTask<P = {}> {

    priority?: number;

    run(errors: any[], props: P): Promise<IAsyncTask<P> | IAsyncTask<P>[]>
}