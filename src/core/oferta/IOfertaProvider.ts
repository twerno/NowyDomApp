import { IOfertaDane, ICechy } from "../../core/oferta/model/IOfertaModel";
import { IAsyncTask } from "../asyncTask/IAsyncTask";

export interface IParseListProps<T extends IListElement = IListElement, D = any> {
    dataProvider: IDataProvider<T, D>;
    priority?: number;
}

export interface IDataProvider<T extends IListElement = IListElement, D = any> {
    readonly inwestycjaId: string;
    readonly developerId: string;
    readonly url: string,
    readonly standard: { data: Partial<ICechy>, raw?: string[] },

    getListUrl: () => string,
    parseListHtml: (html: string, errors: any[], props: IParseListProps<T, D>) => { items: T[], tasks?: IAsyncTask[] };

    getOfferUrl: (listItem: T) => string | string[] | undefined;
    parseOfferHtml: ((html: string[] | string, errors: any[]) => Promise<D>) | null;

    offerBuilder: (listItem: T, details: D | null) => { id: string, dane: IOfertaDane };
}

export interface IListElement {
    id: string;
}