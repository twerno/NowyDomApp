export interface IOfertaRecord {
    id: string;
    developerId: string;
    inwestycjaId: string;

    createdAt: string;

    data: IOfertaDane;

    updates: IOfertaOpe[];
}

export interface IOfertaOpe {
    updatedAt: string,
    updatedBy: 'developer',
    data: Partial<IOfertaDane>,
}

export interface IOfertaDane {
    typ: Typ | IRawData;
    budynek: string | IRawData;
    nrLokalu?: string | IRawData;
    metraz: number | IRawData;
    lpPokoj?: number | IRawData;
    pietro?: number | IRawData;
    kierunek?: Array<KierunkiSwiata | IRawData>;
    standard: { data: Partial<IStandard>, raw?: string[] };

    status: Status | IRawData;
    odbior: { rok: number, kwartal: number } | { rok: number, miesiac: number } | IRawData;
    cena?: number | IRawData;

    plan?: string;
}

export function isRawData(x: any): x is IRawData {
    return typeof x === 'object' && typeof x.raw === 'string';
}

export interface IRawData {
    raw: string;
}

export enum KierunkiSwiata {
    'PÓŁNOC',
    'PÓŁNOCNY-WSCHÓD',
    'WSCHÓD',
    'POŁUDNIOWY-WSCHÓD',
    'POŁUDNIE',
    'POŁUDNIOWY-ZACHÓD',
    'ZACHÓD',
    'PÓŁNOCNY-ZACHÓD'
}

export interface IStandard {
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