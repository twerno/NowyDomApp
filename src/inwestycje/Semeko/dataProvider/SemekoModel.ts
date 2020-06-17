import { IListElement } from "../../../dataProvider/IOfertaProvider";
import { IRawData, Status, ICechy, StronySwiata, OdbiorType, MapWithRawType } from "../../../dataProvider/IOfertaRecord";

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