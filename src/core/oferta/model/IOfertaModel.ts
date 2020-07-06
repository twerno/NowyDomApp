import { StronaSwiata } from "./StronySwiata";
import { Status } from "./Status";
import { OdbiorType } from "./OdbiorType";
import { Typ } from "./Typ";

export interface IOfertaRecord {
    inwestycjaId: string; // partition_key
    developerId: string;
    ofertaId: string; // sort_key

    version: number;
    created_at: number;
    updated_at: number;

    data: IOfertaDane;
}

export interface IOfertaRecordOpe {
    ofertaId: string;  // partition_key
    version: number; // sort_key

    timestamp: number;
    updatedBy: 'developer' | 'server';
    data: Partial<IOfertaDane>;
}

export type MapWithRawType<T extends {}> = { data: Partial<T>, raw?: string[] };

export enum ZASOBY {
    PDF = 'ofertaPdf',
    IMG = 'planImg'
}

export interface IOfertaDane {
    typ: Typ | IRawData;
    budynek: string | IRawData | undefined;
    nrLokalu: string | IRawData | undefined;
    metraz: number | IRawData;
    lpPokoj: number | IRawData | undefined;
    pietro: number | IRawData | undefined;
    liczbaKondygnacji: number | IRawData | undefined;
    stronySwiata: Array<StronaSwiata | IRawData> | undefined;
    cechy: MapWithRawType<ICechy>;

    status: Status | IRawData;
    odbior: OdbiorType | undefined;
    cena: number | IRawData | undefined;

    offerDetailsUrl: string | undefined;

    // id zasobu x url 
    zasobyDoPobrania: { id: string, url: string }[];

    // id zasobu x sciazka na s3
    zasobyPobrane?: { id: string, s3Filename: string }[];

    sprzedaneData?: number;
}

export function isRawData(x: any): x is IRawData {
    return typeof x === 'object'
        && (x.raw === null || typeof x.raw === 'string');
}

export interface IRawData {
    raw: string | null;
}

export interface ICechy {
    ogrzewanie?: 'miejskie' | 'gazowe';
    winda?: boolean;
    balkon?: boolean;
    taras?: boolean;
    piwnica?: number | 'w cenie' | 'brak';
    "miejsce parkingowe"?: 'parking ogólnodostępny' | number;
    "hala garażowa"?: number;
    "garaż indywidualny"?: number;
}
