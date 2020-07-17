import { IRawData, isRawData } from "./IOfertaModel";

export enum StronaSwiata {
    'PÓŁNOC',
    'PÓŁNOCNY-WSCHÓD',
    'WSCHÓD',
    'POŁUDNIOWY-WSCHÓD',
    'POŁUDNIE',
    'POŁUDNIOWY-ZACHÓD',
    'ZACHÓD',
    'PÓŁNOCNY-ZACHÓD'
}

export const StronaSwiataHelper = {
    raw2StronaSwiata,
    stronaSwiata2Short
}

export function raw2StronaSwiata(raw: string | null | undefined): StronaSwiata | IRawData | null {
    if (raw === null || raw === undefined) {
        return null;
    }

    switch (raw.toUpperCase().trim()) {
        case 'PÓŁNOC': return StronaSwiata.PÓŁNOC;
        case 'PÓŁNOCNY-WSCHÓD': return StronaSwiata["PÓŁNOCNY-WSCHÓD"];
        case 'WSCHÓD': return StronaSwiata.WSCHÓD;
        case 'POŁUDNIOWY-WSCHÓD': return StronaSwiata["POŁUDNIOWY-WSCHÓD"];
        case 'POŁUDNIE': return StronaSwiata.POŁUDNIE;
        case 'POŁUDNIOWY-ZACHÓD': return StronaSwiata["POŁUDNIOWY-ZACHÓD"];
        case 'ZACHÓD': return StronaSwiata.ZACHÓD;
        case 'PÓŁNOCNY-ZACHÓD': return StronaSwiata["PÓŁNOCNY-ZACHÓD"];
        default: return { raw };
    }
}

export function stronaSwiata2Short(strona: StronaSwiata | IRawData | undefined | null): string | null {
    if (strona === null || strona === undefined) {
        return null;
    }

    if (isRawData(strona)) {
        return strona.raw || '';
    }

    switch (strona) {
        case StronaSwiata.PÓŁNOC: return 'N';
        case StronaSwiata["PÓŁNOCNY-WSCHÓD"]: return 'NE';
        case StronaSwiata.WSCHÓD: return 'E';
        case StronaSwiata["POŁUDNIOWY-WSCHÓD"]: return 'SE';
        case StronaSwiata.POŁUDNIE: return 'S';
        case StronaSwiata["POŁUDNIOWY-ZACHÓD"]: return 'SW';
        case StronaSwiata.ZACHÓD: return 'W';
        case StronaSwiata["PÓŁNOCNY-ZACHÓD"]: return 'NW';
        default: return '' + strona;
    }
}
