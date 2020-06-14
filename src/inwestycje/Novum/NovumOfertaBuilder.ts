import { ICechy, IOfertaDane, IRawData, Status, StronySwiata, Typ } from '../../dataProvider/IOfertaRecord';
import { NovumDataProvider } from './NovumDataProvider';
import { INovumDetails, INovumListElement } from './NovumSchema';

export default (listItem: INovumListElement, detale?: INovumDetails, pdfUrl?: string): { id: string, dane: IOfertaDane } => {

    const kierunek = kierunekMapper(detale);
    const standard = standardMapper(detale);
    const status = statusMapper(listItem);
    const odbior = odbiorMapper(listItem);

    const zasobyDoPobrania = detale?.sourceOfertaPdfUrl
        ? [{ id: '', url: detale?.sourceOfertaPdfUrl }]
        : [];

    const result: IOfertaDane = {
        typ: Typ.MIESZKANIE,
        budynek: listItem.budynek,
        nrLokalu: listItem.nrLokalu,
        metraz: listItem.metraż,
        lpPokoj: listItem.liczbaPokoi,
        pietro: listItem.piętro,
        stronySwiata: kierunek,
        cechy: standard,

        status,
        odbior,
        cena: listItem.cena,

        offerDetailsUrl: listItem.offerDetailsUrl,
        zasobyDoPobrania,
        zasobyPobrane: []
    };

    return { id: listItem.id, dane: result };
}

// ========================================
// private
// ========================================

const odbiorRegExpr = /(I|II|III|IV) kwartał (\d{4})/;

function odbiorMapper(listItem: INovumListElement): IRawData | { rok: number, kwartal: number } {
    const val = odbiorRegExpr.exec(listItem.odbiór);

    if (val) {
        return {
            kwartal: rzymskie2arabskie(val[1]),
            rok: Number.parseInt(val[2])
        };
    }

    return { raw: listItem.odbiór };
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

function statusMapper(listItem: INovumListElement): Status | { raw: string } {
    switch (listItem.status) {
        case 'wolne': return Status.WOLNE;
        case 'zarezerwowane': return Status.ZAREZERWOWANE;
        default: return { raw: listItem.status };
    }
}

function kierunekMapper(detale?: INovumDetails): Array<StronySwiata | { raw: string }> {
    if (!detale) {
        return [];
    }

    const result = detale.stronyŚwiata
        .split(',')
        .map(v => v.trim())
        .map(stronaSwiataValMapper);

    return result;
}

function stronaSwiataValMapper(val: string): StronySwiata | { raw: string } {
    switch (val) {
        case 'Północ': return StronySwiata.PÓŁNOC;
        case 'Południe': return StronySwiata.POŁUDNIE;
        case 'Wschód': return StronySwiata.WSCHÓD;
        case 'Zachód': return StronySwiata.ZACHÓD;
        default: return { raw: val };
    }
}

function standardMapper(detale?: INovumDetails): { data: ICechy, raw?: string[] } {
    const result = {
        data: { ...NovumDataProvider.standard.data },
        raw: [...NovumDataProvider.standard.raw || []]
    };

    detale?.udogodnienia
        .split(',')
        .map(v => v.trim())
        .forEach(val => {
            const partial = standardValMapper(val);
            if (partial) {
                result.data = { ...result.data, ...partial };
            }
            else {
                result.raw?.push(val)
            }
        })

    return result;
}

function standardValMapper(val: string): Partial<ICechy> | null {
    switch (val) {
        case 'balkon': return { balkon: true };
        case 'taras': return { taras: true };
        default: return null;
    }
}