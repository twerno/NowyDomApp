import { IOfertaDane, IStandard, KierunkiSwiata, Status, Typ } from '../../db/IOfertaRecord';
import { INovumDetails, INovumListElement } from './NovumSchema';

export default (listItem: INovumListElement, detale?: INovumDetails, pdfUrl?: string): { id: string, dane: IOfertaDane } => {

    //TODO - mapowanie

    const kierunek: KierunkiSwiata[] = [];
    const standard: { lista: IStandard, add?: string[] } = { lista: {} };
    const status: Status = Status.WOLNE;
    const odbior = odbiorMapper(listItem);
    const cenaZaMetr = listItem.cena ? listItem.cena / listItem.metraż : undefined;

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
        cenaZaMetr,

        plan: pdfUrl
    };

    return { id: listItem.id, dane: result };
}

const odbiorRegExpr = /(I|II|III|IV) kwartał (\d{4})/;

function odbiorMapper(listItem: INovumListElement): string | { rok: number, kwartal: number } {
    const val = odbiorRegExpr.exec(listItem.odbiór);

    if (val) {
        return {
            kwartal: rzymskie2arabskie(val[1]),
            rok: Number.parseInt(val[2])
        };
    }

    return listItem.odbiór;
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