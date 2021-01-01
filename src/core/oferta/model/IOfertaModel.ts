import { StronaSwiata } from "./StronySwiata";
import { Status } from "./Status";
import { OdbiorType } from "./OdbiorType";
import { Typ } from "./Typ";
import { IRawData } from "./IRawData";
import { ICechy } from "./ICechy";

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
    updatedBy: 'developer' | 'server' | 'tech';
    data: Partial<IOfertaDane>;
}

export type MapWithRawType<T extends {}> = { map: Partial<T>, raw?: string[] };
export type ListWithRawType<T> = { list: T[], raw?: string[] };

export enum ZASOBY {
    PDF = 'ofertaPdf',
    IMG = 'planImg',
    IMG_GARAZ = 'garazImg',
    IMG_WIZUALIZACJA = 'wizualizacjaImg',
}

export interface IOfertaDane {
    // kind - house, apartment
    typ: Typ | IRawData;
    // house number
    budynek: string | IRawData | undefined;
    // apartment number
    nrLokalu: string | IRawData | undefined;
    // apartment size
    metraz: number | IRawData;
    // number of rooms
    lpPokoj: number | IRawData | undefined;
    // number of floors in the apartment
    pietro: number | IRawData | undefined;
    // number of floors in the building
    liczbaKondygnacji: number | IRawData | undefined;
    // the directions of the world
    stronySwiata: Array<StronaSwiata | IRawData> | undefined;
    // additional properties
    cechy: MapWithRawType<ICechy>;

    status: Status | IRawData;
    // when its ready
    odbior: OdbiorType | undefined;
    // price
    cena: number | IRawData | undefined;

    // url of details page
    offerDetailsUrl: string | undefined;

    // Map<id, url>
    // additional resources (pdf, etc) to download
    zasobyDoPobrania: { id: string, url: string | string[] }[];

    // id zasobu x sciazka na s3
    // additional resources (pdf, etc) already downloaded
    zasobyPobrane?: { id: string, s3Filename: string }[];

    // data of sale
    sprzedaneData?: number;
}





