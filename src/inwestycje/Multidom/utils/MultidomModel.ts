import { IListElement } from "../../../core/oferta/IOfertaProvider";
import { ICechy, IRawData, MapWithRawType } from "../../../core/oferta/model/IOfertaModel";
import { Status } from "../../../core/oferta/model/Status";

export interface IMultiDomListElement extends IListElement {
    budynek?: string | IRawData;
    nrLokalu: string | IRawData;
    metraz: number | IRawData;
    pietro: number | IRawData;
    lpPokoj: number | IRawData;
    cena?: number | IRawData;
    cechy: MapWithRawType<ICechy>;

    status: Status | IRawData;

    detailsUrl?: string | IRawData;
}

export interface IMultidomDetails {
    zasobyDoPobrania: { id: string, url: string }[];
}