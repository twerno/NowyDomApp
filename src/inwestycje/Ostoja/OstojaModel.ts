import { IListElement } from "core/oferta/IOfertaProvider";
import { IRawData, ICechy } from "../../core/oferta/model/IOfertaModel";
import { StronaSwiata } from "../../core/oferta/model/StronySwiata";
import { Status } from "../../core/oferta/model/Status";

export interface IOstojaListElement extends IListElement {
    budynek: string;
    nrLokalu: string;
    pietro: number | IRawData;
    metraz: number | IRawData;
    lpPokoj: number | IRawData;
    status: Status;
    cena?: number | IRawData;
    offerDetailsUrl?: string;
    cechy: { data: Partial<ICechy>, raw?: string[] };
    stronySwiata: Array<StronaSwiata | IRawData>;
}

export interface IOstojaOfferDetails {
    odbior: { rok: number, miesiac: number } | IRawData;
    sourceOfertaPdfUrl?: string;
}