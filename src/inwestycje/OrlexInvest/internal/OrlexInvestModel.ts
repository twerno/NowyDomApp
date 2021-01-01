import { IListElement } from "../../../core/oferta/IOfertaProvider";
import { IRawData } from "../../../core/oferta/model/IRawData";
import { Status } from "../../../core/oferta/model/Status";
import { Typ } from "../../../core/oferta/model/Typ";

export interface IOrlexInvestListElement extends IListElement {
    typ: Typ,
    lpPokoj: number | IRawData;
    nrLokalu: string | IRawData;
    pietro: number | IRawData;
    metraz: number | IRawData;
    status: Status | IRawData;
    cena?: number | IRawData;
    offerDetailsUrl?: string | IRawData;
    budynek?: string | IRawData;
    zasobyDoPobrania: { id: string, url: string }[];
}

export interface IOrlexInvestOfferDetails {
}