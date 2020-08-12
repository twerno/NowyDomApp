import { IListElement } from "../../../core/oferta/IOfertaProvider";
import { IRawData } from "../../../core/oferta/model/IOfertaModel";
import { Status } from "../../../core/oferta/model/Status";
import { Typ } from "../../../core/oferta/model/Typ";

export interface IMatBudListElement extends IListElement {
    typ: Typ,
    budynek?: string | IRawData;
    pietro: number | IRawData;
    metraz: number | IRawData;
    nrLokalu: string | IRawData;
    status: Status | IRawData;
    zasobyDoPobrania: { id: string, url: string }[];
}

export interface IMatBudOfferDetails {

}