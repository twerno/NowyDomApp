import { IOfertaDane } from "../../core/oferta/model/IOfertaModel";
import { IAsyncTask } from "../asyncTask/IAsyncTask";
import TypeUtils from "../utils/TypeUtils";
import { IRawData, isRawData } from "./model/IRawData";
import ProviderOfferHelper from "./tasks/ProviderOfferHelper";

export interface IDataProviderParserProps<T extends IListElement = IListElement, Details = any, Data = any> {
    dataProvider: IDataProvider<T, Details, Data>;
    priority?: number;
}

export interface IDataProvider<T extends IListElement = IListElement, Details = any, Data = any> {
    readonly inwestycjaId: string;
    readonly developerId: string;
    readonly url: string;
    readonly data: Data;
    readonly miasto: string;
    readonly dzielnica?: string;

    getListUrl: () => string | string[],
    parseListHtml: (html: string, errors: any[], props: IDataProviderParserProps<T, Details, Data>) => { items: T[], tasks?: IAsyncTask[] };

    getOfferUrl: (listItem: T) => string | string[] | undefined;
    parseOfferHtml: ((html: string[] | string, errors: any[], offerId: string, props: IDataProviderParserProps<T, Details, Data>) => Promise<Details>) | null;

    offerModelBuilder: (listItem: T, details: Details | null, props: IDataProviderParserProps<T, Details, Data>) => { id: string, dane: IOfertaDane };
}

export interface IListElement {
    id: string;
}

export function ofertaIdBuilderExcept(skladowe: Array<string | undefined | IRawData | null>): string {
    for (const sk of skladowe) {
        if (isRawData(sk)) {
            throw new Error(`Błąd budowania id z pól: ${JSON.stringify(skladowe)}`);
        }
    }

    const id = skladowe.filter(TypeUtils.notEmpty)
        .join('-')
        .replace(/\s+/g, '-');
    return ProviderOfferHelper.safeFileName(id);
}