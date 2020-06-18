import { IOfertaDane, ICechy } from "dataProvider/IOfertaRecord";
import { IAsyncTask } from "utils/asyncTask/IAsyncTask";

export interface ISubTaskProps<T extends IListElement = IListElement, D = any> {
    dataProvider: IDataProvider<T, D>;
    priority?: number;
}

export interface IDataProvider<T extends IListElement = IListElement, D = any> {
    readonly inwestycjaId: string;
    readonly developerId: string;
    readonly url: string,
    readonly standard: { data: Partial<ICechy>, raw?: string[] },

    getListUrl: () => string,
    parseListHtml: (html: string, errors: any[], subTaskProps: ISubTaskProps<T, D>) => { items: T[], tasks?: IAsyncTask[] };

    getOfferUrl: (listItem: T) => string | string[] | undefined;
    parseOfferHtml: (html: string[] | string, errors: any[]) => Promise<D>;

    offerBuilder: (listItem: T, details: D | null) => { id: string, dane: IOfertaDane };
}

export interface IListElement {
    id: string;
}