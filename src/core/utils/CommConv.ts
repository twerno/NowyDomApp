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

const lpRzymskie = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

function lp2Rzymskie(lp: number): string {
    const result = lpRzymskie[lp - 1];

    return result || `${lp}`;
}

function rzymskie2arabskie(liczbaRzymska: string): number {
    switch (liczbaRzymska) {
        case 'I': return 1;
        case 'II': return 2;
        case 'III': return 3;
        case 'IV': return 4;
    }

    throw new Error(`"${liczbaRzymska}" nie jest rozpoznawalną liczbą rzymską.`);
}