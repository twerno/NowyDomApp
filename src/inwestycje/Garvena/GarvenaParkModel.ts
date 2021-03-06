import { IListElement } from "../../core/oferta/IOfertaProvider";
import { IRawData } from "../../core/oferta/model/IRawData";
import { Status } from "../../core/oferta/model/Status";
import { OdbiorType } from "../../core/oferta/model/OdbiorType";

export interface IGarvenaParkListElement extends IListElement {
    nrLokalu: string;
    liczbaKondygnacji: number | IRawData;
    metraz: number | IRawData;
    powiezchniaOgrodu?: number | IRawData;
    lpPokoj: number | IRawData;
    odbior: OdbiorType;
    status: Status | IRawData;
    zasobyDoPobrania: { id: string, url: string }[];
}

export type IGarvenaParkDetails = {};