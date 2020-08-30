import { IListElement } from "../../../core/oferta/IOfertaProvider";
import { ICechy, IRawData, MapWithRawType } from "../../../core/oferta/model/IOfertaModel";
import { Status } from "../../../core/oferta/model/Status";
import { Typ } from "../../../core/oferta/model/Typ";

export interface IZaciszeListElement extends IListElement {
    typ: Typ,
    budynek: string | IRawData;

    pietro: number | IRawData;
    nrLokalu: string | IRawData;
    lpPokoj: number | IRawData;
    metraz: number | IRawData;
    cechy: MapWithRawType<ICechy>;
    cena: number | IRawData;
    status: Status | IRawData;
    offerDetailsUrl: string | undefined;
}

export type IZaciszeOfferDetails = {
    zasobyDoPobrania: { id: string, url: string | string[] }[];
};
