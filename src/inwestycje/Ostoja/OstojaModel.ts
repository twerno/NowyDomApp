import { IListElement } from "dataProvider/IOfertaProvider";
import { IRawData, Status, ICechy, StronySwiata } from "../../dataProvider/IOfertaRecord";

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
    stronySwiata: Array<StronySwiata | IRawData>;
}

export interface IOstojaOfferDetails {
    odbior: { rok: number, miesiac: number } | IRawData;
    sourceOfertaPdfUrl?: string;
}