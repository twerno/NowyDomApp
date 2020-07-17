import { IListElement } from "../../../core/oferta/IOfertaProvider";
import { IRawData, ICechy, ListWithRawType, MapWithRawType } from "../../../core/oferta/model/IOfertaModel";
import { Status } from "../../../core/oferta/model/Status";
import { StronaSwiata } from "../../../core/oferta/model/StronySwiata";
import { Typ } from "../../../core/oferta/model/Typ";
import { OdbiorType } from "@src/core/oferta/model/OdbiorType";

export interface IEuroStylListElement extends IListElement {
    typ: Typ,
    nrLokalu: string | IRawData;
    pietro: number | IRawData;
    metraz: number | IRawData;
    lpPokoj: number | IRawData;
    status: Status;
    odbior: OdbiorType | IRawData;
    offerDetailsUrl?: string | IRawData;
    cechy: MapWithRawType<ICechy>;
    stronySwiata: ListWithRawType<StronaSwiata>;
}

export interface IEuroStylOfferDetails {
    budynek: string;

    cena?: number | IRawData;
    zasobyDoPobrania: { id: string, url: string }[];
}