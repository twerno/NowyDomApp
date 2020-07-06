import { IListElement } from "../../core/oferta/IOfertaProvider";
import { IRawData } from "../../core/oferta/model/IOfertaModel";
import { Status } from "../../core/oferta/model/Status";
import { OdbiorType } from "../../core/oferta/model/OdbiorType";

export interface IGarvenaParkListElement extends IListElement {
    // budynek: string;
    nrLokalu: string;
    liczbaKondygnacji: number | IRawData;
    metraz: number | IRawData;
    powiezchniaOgrodu?: number | IRawData;
    liczbaPokoi: number | IRawData;
    odbior: OdbiorType;
    status: Status | IRawData;
    zasobyDoPobrania: { id: string, url: string }[];
}

export type IGarvenaParkDetails = {};