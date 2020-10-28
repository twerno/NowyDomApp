import { OdbiorType } from "@src/core/oferta/model/OdbiorType";
import { StronaSwiata } from "@src/core/oferta/model/StronySwiata";
import { IListElement } from "../../../core/oferta/IOfertaProvider";
import { ICechy, IRawData, ListWithRawType, MapWithRawType } from "../../../core/oferta/model/IOfertaModel";
import { Status } from "../../../core/oferta/model/Status";
import { Typ } from "../../../core/oferta/model/Typ";

export interface IDomapartListElement extends IListElement {
    typ: Typ,
    budynek: string | IRawData;
    nrLokalu: string | IRawData;
    pietro: number | IRawData;
    metraz: number | IRawData;
    lpPokoj: number | IRawData;
    status: Status | IRawData;
    odbior: OdbiorType;
    offerDetailsUrl: string | undefined;
}

export interface IDomapartOfferDetails {
    zasobyDoPobrania: { id: string, url: string | string[] }[];
    cechy: MapWithRawType<ICechy>;
    stronySwiata: ListWithRawType<StronaSwiata>;
};
