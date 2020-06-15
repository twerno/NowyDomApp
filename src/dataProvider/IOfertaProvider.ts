import { IOfertaDane, ICechy } from "dataProvider/IOfertaRecord";

export interface IDataProvider<T extends IListElement = IListElement, D = any> {
    inwestycjaId: string;
    developerId: string;
    url: string,
    standard: { data: Partial<ICechy>, raw?: string[] },

    getListUrl: () => Promise<Set<string>>,
    parseListHtml: (html: string) => T[];

    getOfferUrl: (listItem: T) => Set<string>;
    parseOfferHtml: (html: string) => Promise<D>;
    offerReducer?: (source1: D, source2: D) => D;

    offerBuilder: (listItem: T, details?: D) => { id: string, dane: IOfertaDane };
}

export interface IListElement {
    id: string;
}