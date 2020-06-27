import { IRawData, isRawData } from "./IOfertaModel";

export enum Status {
    'PLANOWANE',
    'WOLNE',
    'ZAREZERWOWANE',
    'SPRZEDANE',
    'USUNIETA'
}

export const StatusHelper = {
    status2string,
}

export function status2string(status: Status | IRawData | undefined | null): string | null {
    if (status === null || status === undefined) {
        return null;
    }

    if (isRawData(status)) {
        return status.raw || '';
    }

    switch (status) {
        case Status.PLANOWANE: return 'Planowane';
        case Status.WOLNE: return 'Wolne';
        case Status.ZAREZERWOWANE: return 'Rezerwacja';
        case Status.SPRZEDANE: return 'Sprzedane';
        case Status.USUNIETA: return 'Usunięte';
        default: return '' + status;
    }
}
