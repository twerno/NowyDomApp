export default {
    parseMiesiac,
    floatParser
}

function parseMiesiac(source: string) {
    switch (source) {
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
        default: return null;
    }
}

function floatParser(rawText: string, customRegExpr?: RegExp) {
    const floatRegExpr = customRegExpr || /([\d,.]+)/;
    const exprResult = floatRegExpr.exec(rawText || '');
    if (exprResult === null || exprResult[1] === null) {
        return null;
    }
    const parsedNumber = Number.parseFloat(exprResult[1].replace(/,/g, '.'));
    return isNaN(parsedNumber)
        ? null
        : parsedNumber;
}