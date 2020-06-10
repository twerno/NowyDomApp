import { IOfertaDane, IStandard, KierunkiSwiata, Status, Typ, isRawData, IRawData } from '../../dataProvider/IOfertaRecord';
import { INovumDetails, INovumListElement } from './NovumSchema';
import { NovumDataProvider } from './NovumDataProvider';

export default (listItem: INovumListElement, detale?: INovumDetails, pdfUrl?: string): { id: string, dane: IOfertaDane } => {

    const kierunek = kierunekMapper(detale);
    const standard = standardMapper(detale);
    const status = statusMapper(listItem);
    const odbior = odbiorMapper(listItem);

    const result: IOfertaDane = {
        typ: Typ.MIESZKANIE,
        budynek: listItem.budynek,
        nrLokalu: listItem.nrLokalu,
        metraz: listItem.metraż,
        lpPokoj: listItem.liczbaPokoi,
        pietro: listItem.piętro,
        kierunek,
        standard,

        status,
        odbior,
        cena: listItem.cena,

        kartaOfertyUrl: pdfUrl
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

function kierunekMapper(detale?: INovumDetails): Array<KierunkiSwiata | { raw: string }> {
    if (!detale) {
        return [];
    }

    const result = detale.stronyŚwiata
        .split(',')
        .map(v => v.trim())
        .map(stronaSwiataValMapper);

    return result;
}

function stronaSwiataValMapper(val: string): KierunkiSwiata | { raw: string } {
    switch (val) {
        case 'Północ': return KierunkiSwiata.PÓŁNOC;
        case 'Południe': return KierunkiSwiata.POŁUDNIE;
        case 'Wschód': return KierunkiSwiata.WSCHÓD;
        case 'Zachód': return KierunkiSwiata.ZACHÓD;
        default: return { raw: val };
    }
}

function standardMapper(detale?: INovumDetails): { data: IStandard, raw?: string[] } {
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

function standardValMapper(val: string): Partial<IStandard> | null {
    switch (val) {
        case 'balkon': return { balkon: true };
        case 'taras': return { taras: true };
        default: return null;
    }
}