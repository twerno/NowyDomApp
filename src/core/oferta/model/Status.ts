import { IRawData, isRawData } from "./IRawData";

export enum Status {
    WOLNE = 1,
    REZERWACJA = 2,
    SPRZEDANE = 3,
    // 4 stary status "sprzedane" - nie do wykorzystania
}

export const StatusHelper = {
    status2string,
    isStatusAktywny
}

export function status2string(status: Status | IRawData | undefined | null): string | null {
    if (status === null || status === undefined) {
        return null;
    }

    if (isRawData(status)) {
        return status.raw || '';
    }

    switch (status) {
        case Status.WOLNE: return 'Wolne';
        case Status.REZERWACJA: return 'Rezerwacja';
        case Status.SPRZEDANE:
        case 4: return 'Sprzedane'; // 

        default: return '' + status;
    }
}

export function isStatusAktywny(status: Status | IRawData) {
    return status === Status.WOLNE
        || isRawData(status);
}