import { ICechy } from "@src/core/oferta/model/ICechy";
import { IRawData } from "@src/core/oferta/model/IRawData";
import { IListElement } from "../../../core/oferta/IOfertaProvider";
import { ListWithRawType, MapWithRawType } from "../../../core/oferta/model/IOfertaModel";
import { Status } from "../../../core/oferta/model/Status";
import { StronaSwiata } from "../../../core/oferta/model/StronySwiata";
import { Typ } from "../../../core/oferta/model/Typ";

export interface ILokerListElement extends IListElement {
    typ: Typ,
    budynek: string | IRawData;
    nrLokalu: string | IRawData;
    pietro: number | IRawData;
    lpPokoj: number | IRawData;
    metraz: number | IRawData;
    stronySwiata: ListWithRawType<StronaSwiata>;
    status: Status | IRawData;
    cechy: MapWithRawType<ICechy>;
    zasobyDoPobrania: { id: string, url: string }[];
    offerDetailsUrl: string | undefined;
}

export type ILokerOfferDetails = {};
