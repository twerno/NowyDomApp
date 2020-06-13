import { IOfertaDane, ICechy } from "dataProvider/IOfertaRecord";

export interface IDataProvider<T extends IListElement = IListElement, D = any> {
    inwestycjaId: string;
    developerId: string;
    url: string,
    standard: { data: Partial<ICechy>, raw?: string[] },

    listUrlProvider: () => Promise<Set<string>>,
    listHtmlParser: (html: string) => T[];

    offerDetailsUrlProvider: (listItem: T) => Set<string>;
    offerDetailsHtmlParser: (html: string) => Promise<D>;
    offerDetailsMerger?: (source1: D, source2: D) => D;

    offerCardUrlProvider: (listItem: T, detale?: D) => string | undefined;

    offerBuilder: (listItem: T, details?: D) => { id: string, dane: IOfertaDane };
}

export interface IListElement {
    id: string;
}