export default {
    miesiac2str,
    lp2Rzymskie
}

const miesiace = [
    'styczen', 'luty', 'marzec',
    'kwiecień', 'maj', 'czerwiec',
    'lipiec', 'sierpień', 'wrzesień',
    'październik', 'listopad', 'grudzień'
];

function miesiac2str(idx: number): string {
    const result = miesiace[idx - 1];

    return result || `${idx}`;
}

const lpRzymskie = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

function lp2Rzymskie(lp: number): string {
    const result = lpRzymskie[lp - 1];

    return result || `${lp}`;
}