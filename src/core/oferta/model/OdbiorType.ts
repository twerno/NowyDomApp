import CommConv from "../../../inwestycje/utils/CommConv";
import { IRawData, isRawData } from "./IRawData";

type OdbiorKwartalType = { rok: number, kwartal: number };
type OdbiorMiesiacType = { rok: number, miesiac: number };
export type OdbiorType = OdbiorKwartalType | OdbiorMiesiacType | IRawData;

export const OdbiorTypeHelper = {
    odbior2Str
}

function odbior2Str(src: OdbiorType | undefined | null): string | null {
    if (src === undefined || src === null) {
        return null;
    }

    if (isRawData(src)) {
        return src.raw;
    }

    if (isOdbiorKwartalType(src)) {
        return `${CommConv.lp2Rzymskie(src.kwartal)} kwartał ${src.rok}`
    }

    return `${CommConv.miesiac2str(src.miesiac)} ${src.rok}`;
}

// ********************************

function isOdbiorKwartalType(src: any): src is OdbiorKwartalType {
    return src
        && typeof src === 'object'
        && typeof src.rok === 'number'
        && typeof src.kwartal === 'number';
}

function isOdbiorMiesiacType(src: any): src is OdbiorMiesiacType {
    return src
        && typeof src === 'object'
        && typeof src.rok === 'number'
        && typeof src.miesiac === 'number';
}
