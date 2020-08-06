export default {
    miesiac2str,
    lp2Rzymskie,
    rzymskie2arabskie
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

const lpRzymskie = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

function lp2Rzymskie(lp: number): string {
    const result = lpRzymskie[lp - 1];

    return result || `${lp}`;
}

function rzymskie2arabskie(liczbaRzymska: string): number {
    const result = lpRzymskie.findIndex(v => v === liczbaRzymska.toUpperCase());

    if (result >= 0) {
        return result + 1;
    }

    throw new Error(`"${liczbaRzymska}" nie jest rozpoznawalną liczbą rzymską.`);
}