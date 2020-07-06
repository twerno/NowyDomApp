import { IListElement } from "../../../core/oferta/IOfertaProvider";
import { IRawData, ICechy, MapWithRawType } from "../../../core/oferta/model/IOfertaModel";
import { StronaSwiata } from "../../../core/oferta/model/StronySwiata";
import { Status } from "../../../core/oferta/model/Status";
import { OdbiorType } from "../../../core/oferta/model/OdbiorType";

export interface ISemekoListElement extends IListElement {
    budynek: string;
    nrLokalu: string;
    pietro: number | IRawData;
    metraz: number | IRawData;
    lpPokoj: number | IRawData;
    odbior: OdbiorType;
    status: Status;
    cechy: MapWithRawType<ICechy>;
    offerDetailsUrl: string | IRawData;
    zasobyDoPobrania: { id: string, url: string }[];
}

export interface ISemekoDetails {
    stronySwiata: Array<StronaSwiata | IRawData>;
    zasobyDoPobrania: { id: string, url: string }[];
}