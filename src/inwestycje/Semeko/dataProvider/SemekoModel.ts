import { IListElement } from "../../../dataProvider/IOfertaProvider";
import { IRawData, Status, ICechy, StronySwiata } from "../../../dataProvider/IOfertaRecord";

export interface ISemekoListElement extends IListElement {
    budynek: string;
    nrLokalu: string;
    piętro: number | IRawData;
    metraz: number | IRawData;
    liczbaPokoi: number | IRawData;
    odbior: { rok: number, miesiac: number } | IRawData;
    status: Status;
    cechy: { data: Partial<ICechy>, raw?: string[] };
    detailsUrl: string;
    zasobyDoPobrania: { id: string, url: string }[];
}

export interface ISemekoDetails {
    stronySwiata: Array<StronySwiata | IRawData>;
    zasobyDoPobrania: { id: string, url: string }[];
}