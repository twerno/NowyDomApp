import { IRawData, isRawData } from "./IRawData";

export enum Typ {
    'MIESZKANIE',
    'DOM',
    'DOM_SZEREGOWY'
}

export const TypHelper = {
    typ2str
}

function typ2str(typ: Typ | IRawData | undefined | null) {
    if (typ === null || typ === undefined) {
        return null;
    }

    if (isRawData(typ)) {
        return typ.raw || '';
    }

    switch (typ) {
        case Typ.DOM: return 'Dom';
        case Typ.MIESZKANIE: return 'Mieszkanie';
        default: return '' + typ;
    }
}