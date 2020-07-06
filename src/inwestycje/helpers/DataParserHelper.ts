import { Status } from "../../core/oferta/model/Status";
import { ICechy } from "../../core/oferta/model/IOfertaModel";

export default {
    pietro,
    status,
    cecha,
    regExp,
    int,
    float,
    floatOptional,
    miesiac,
}

function pietro(rawText: string | null | undefined): number | null {
    if (rawText === null || rawText === undefined) {
        return null;
    }

    // może raw jest po prostu liczbą?
    const text = rawText.trim().toLocaleLowerCase();
    const num = Number.parseInt(text);
    if (!Number.isNaN(num)) {
        return num;
    }

    // wyłapujemy słowo "parter"
    if (text === 'parter') {
        return 0;
    }

    // wyłapujemy ciągi "XX piętro"
    const exprResult = /(\d)+\s*pi[eę]tro/.exec(text);
    if (exprResult) {
        return Number.parseInt(exprResult[1]) || null;
    }

    // brak dopasowania
    return null;
}

function status(rawText: string | null | undefined): number | null {
    if (rawText === null || rawText === undefined) {
        return null;
    }

    const text = rawText.trim().toLocaleLowerCase();

    switch (text) {
        case 'sprzedane': return Status.SPRZEDANE;
        case 'zarezerwowane': return Status.REZERWACJA;
        case 'rezerwacja': return Status.REZERWACJA;
        case 'wolne': return Status.WOLNE;
    }
    return null;
}

function cecha(rawText: string | null | undefined, convDataList: Array<{ text: string, cecha: ICechy }>): ICechy | null {
    if (rawText === null || rawText === undefined) {
        return null;
    }

    const text = rawText.trim().toLocaleLowerCase();

    const convData = convDataList.find((v => v.text.trim().toLocaleLowerCase() === text));
    if (convData) {
        return convData.cecha;
    }

    return null;
}

function regExp(regExpr: RegExp): (rawText: string | undefined | null) => string | null {
    return (rawText) => {
        if (rawText === null || rawText === undefined) {
            return null;
        }

        const regExpResult = regExpr.exec(rawText);

        return regExpResult
            ? regExpResult[1] || null
            : null;
    }
}

function miesiac(source: string | undefined | null) {
    if (source === null || source === undefined) {
        return null;
    }

    switch (source.toLocaleLowerCase().trim()) {
        case 'styczeń': return 1;
        case 'luty': return 2;
        case 'marzec': return 3;
        case 'kwiecień': return 4;
        case 'maj': return 5;
        case 'czerwiec': return 6;
        case 'lipiec': return 7;
        case 'sierpień': return 8;
        case 'wrzesień': return 9;
        case 'październik': return 10;
        case 'listopad': return 11;
        case 'grudzień': return 12;
    }

    return null;
}

const defaultIntRegExp = /(-?[\d]+)/;
function int(customRegExpr?: RegExp): (rawText: string | undefined | null) => number | null {
    return (rawText) => parseNumberFn(
        rawText,
        customRegExpr || defaultIntRegExp,
        val => Number.parseInt(val)
    );
}

const defaultFloatRegExp = /(-?[\d,.]+)/;
function float(customRegExpr?: RegExp): (rawText: string | undefined | null) => number | null {
    return (rawText) => parseNumberFn(
        rawText,
        customRegExpr || defaultFloatRegExp,
        val => Number.parseFloat(val.replace(/,/g, '.'))
    );
}

function floatOptional(customRegExpr?: RegExp): (rawText: string | undefined | null) => number | null | undefined {
    return (rawText) => {
        const result = parseNumberFn(
            rawText,
            customRegExpr || defaultFloatRegExp,
            val => Number.parseFloat(val.replace(/,/g, '.'))
        );
        return result === null ? undefined : result;
    };
}

function parseNumberFn(rawText: string | undefined | null, regExp: RegExp, parser: (val: string) => number) {
    if (rawText === null || rawText === undefined) {
        return null;
    }

    const regExpResult = regExp.exec(rawText || '');
    if (regExpResult === null) {
        return null;
    }

    const val = regExpResult[1];
    if (val === null || val === undefined) {
        return null;
    }

    const parsedNumber = parser(val);
    return isNaN(parsedNumber)
        ? null
        : parsedNumber;
}
