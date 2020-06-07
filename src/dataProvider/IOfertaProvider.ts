import { IOfertaDane } from "db/IOfertaRecord";
import { IOfertaRepoKey } from "db/OfertaRecordRepo";

export interface IDataProvider<T extends IListElement = IListElement, D = any> {
    nazwa: string;
    developer: string;
    url: string,

    listUrlProvider: () => Promise<string[]>,
    listMapper: (rawHtml: string) => T[];

    detailsUrlProvider: (listItem: T) => string;
    detailsMapper: (rawHtml: string, listItem: T) => Promise<D>;

    planUrlProvider: (listItem: T, detale: D) => string | undefined;

    ofertaBuilder: (listItem: T, detale?: D, pdfUrl?: string) => { id: string, dane: IOfertaDane };
}

export interface IListElement extends Required<IOfertaRepoKey> {
    detailsUrl: string;
}