import { IListElement } from "../../../core/oferta/IOfertaProvider";
import { IRawData } from "../../../core/oferta/model/IOfertaModel";
import { Status } from "../../../core/oferta/model/Status";
import { Typ } from "../../../core/oferta/model/Typ";

export interface IHSDomListElement extends IListElement {
    typ: Typ,
    budynek: string | IRawData;
    nrLokalu: string | IRawData;
    pietro: number | IRawData;
    metraz: number | IRawData;
    lpPokoj: number | IRawData;
    status: Status | IRawData;
    cena: number | IRawData;

    offerDetailsUrl: string | undefined;
}

export type IHSDomOfferDetails = {
    zasobyDoPobrania: { id: string, url: string | string[] }[];
};
