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
    typ: Typ;
    budynek: string;
    nrLokalu?: string;
    metraz: number;
    lpPokoj?: number;
    pietro?: number;
    kierunek?: KierunkiSwiata[];
    standard: { lista: Partial<IStandard>, add?: string[] };

    status: Status;
    odbior: string | { rok: number, kwartal: number } | { rok: number, miesiac: number };
    cena?: number;
    cenaZaMetr?: number;

    plan?: string;
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