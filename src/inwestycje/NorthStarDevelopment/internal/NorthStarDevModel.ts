import { IListElement } from "../../../core/oferta/IOfertaProvider";
import { IRawData } from "../../../core/oferta/model/IOfertaModel";
import { Status } from "../../../core/oferta/model/Status";
import { Typ } from "../../../core/oferta/model/Typ";

export interface INorthStarDevListElement extends IListElement {
    typ: Typ,
    metraz: number | IRawData;
    pietro: number | IRawData;
    lpPokoj: number | IRawData;
    status: Status | IRawData;
    nrLokalu: string | IRawData;
    zasobyDoPobrania: { id: string, url: string }[];
}

export type INorthStarDevOfferDetails = {};
