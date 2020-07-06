import { IOfertaDane, ICechy } from "../../core/oferta/model/IOfertaModel";
import { IAsyncTask } from "../asyncTask/IAsyncTask";

export interface IDataProviderParserProps<T extends IListElement = IListElement, Details = any, Data = any> {
    dataProvider: IDataProvider<T, Details, Data>;
    priority?: number;
}

export interface IDataProvider<T extends IListElement = IListElement, Details = any, Data = any> {
    readonly inwestycjaId: string;
    readonly developerId: string;
    readonly url: string,
    readonly data: Data,

    getListUrl: () => string,
    parseListHtml: (html: string, errors: any[], props: IDataProviderParserProps<T, Details, Data>) => { items: T[], tasks?: IAsyncTask[] };

    getOfferUrl: (listItem: T) => string | string[] | undefined;
    parseOfferHtml: ((html: string[] | string, errors: any[], offerId: string, props: IDataProviderParserProps<T, Details, Data>) => Promise<Details>) | null;

    offerBuilder: (listItem: T, details: Details | null) => { id: string, dane: IOfertaDane };
}

export interface IListElement {
    id: string;
}