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

export type OdbiorType = { rok: number, kwartal: number } | { rok: number, miesiac: number } | IRawData;
export type MapWithRawType<T extends object> = { data: Partial<T>, raw?: Array<string | null> };
export const KartaOfertyPdf = 'ofertaPdf';

export interface IOfertaDane {
    typ: Typ | IRawData;
    budynek?: string | IRawData;
    nrLokalu?: string | IRawData;
    metraz: number | IRawData;
    lpPokoj?: number | IRawData;
    pietro?: number | IRawData;
    liczbaKondygnacji?: number | IRawData;
    stronySwiata?: Array<StronySwiata | IRawData>;
    cechy: MapWithRawType<ICechy>;

    status: Status | IRawData;
    odbior?: OdbiorType;
    cena?: number | IRawData;

    offerDetailsUrl?: string;

    // id zasobu x url 
    zasobyDoPobrania: { id: string, url: string }[];

    // id zasobu x sciazka na s3
    zasobyPobrane?: { id: string, s3Filename: string }[];
}

export function isRawData(x: any): x is IRawData {
    return typeof x === 'object'
        && (x.raw === null || typeof x.raw === 'string');
}

export interface IRawData {
    raw: string | null;
}

export enum StronySwiata {
    'PÓŁNOC',
    'PÓŁNOCNY-WSCHÓD',
    'WSCHÓD',
    'POŁUDNIOWY-WSCHÓD',
    'POŁUDNIE',
    'POŁUDNIOWY-ZACHÓD',
    'ZACHÓD',
    'PÓŁNOCNY-ZACHÓD'
}

export function stronySwiataMaper(raw: string): StronySwiata | IRawData {
    switch (raw.toUpperCase().trim()) {
        case 'PÓŁNOC': return StronySwiata.PÓŁNOC;
        case 'PÓŁNOCNY-WSCHÓD': return StronySwiata["PÓŁNOCNY-WSCHÓD"];
        case 'WSCHÓD': return StronySwiata.WSCHÓD;
        case 'POŁUDNIOWY-WSCHÓD': return StronySwiata["POŁUDNIOWY-WSCHÓD"];
        case 'POŁUDNIE': return StronySwiata.POŁUDNIE;
        case 'POŁUDNIOWY-ZACHÓD': return StronySwiata["POŁUDNIOWY-ZACHÓD"];
        case 'ZACHÓD': return StronySwiata.ZACHÓD;
        case 'PÓŁNOCNY-ZACHÓD': return StronySwiata["PÓŁNOCNY-ZACHÓD"];
        default: return { raw };
    }
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

export enum Status {
    'PLANOWANE',
    'WOLNE',
    'ZAREZERWOWANE',
    'SPRZEDANE',
    'USUNIETA'
}

export enum Typ {
    'MIESZKANIE',
    'DOM'
}