import { IListElement } from "../../../core/oferta/IOfertaProvider";
import { IRawData, Status, ICechy, StronySwiata, OdbiorType, MapWithRawType } from "../../../core/oferta/model/IOfertaModel";

export interface ISemekoListElement extends IListElement {
    budynek: string;
    nrLokalu: string;
    pietro: number | IRawData;
    metraz: number | IRawData;
    liczbaPokoi: number | IRawData;
    odbior: OdbiorType;
    status: Status;
    cechy: MapWithRawType<ICechy>;
    detailsUrl: string;
    zasobyDoPobrania: { id: string, url: string }[];
}

export interface ISemekoDetails {
    stronySwiata: Array<StronySwiata | IRawData>;
    zasobyDoPobrania: { id: string, url: string }[];
}