import { IListElement } from "../../../core/oferta/IOfertaProvider";
import { ICechy, IRawData } from "../../../core/oferta/model/IOfertaModel";
import { Status } from "../../../core/oferta/model/Status";
import { Typ } from "../../../core/oferta/model/Typ";

export interface IMaskoInvestListElement extends IListElement {
    typ: Typ,
    metraz: number | IRawData;
    pietro: number | IRawData;
    lpPokoj: number | IRawData;
    cechy: { map: Partial<ICechy>, raw?: string[] };
    status: Status | IRawData;
    odbior: { rok: number, miesiac: number } | IRawData;
    sourceOfertaPdfUrl: string;
}
