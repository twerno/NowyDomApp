import { HTMLElement, parse } from 'node-html-parser';
import { IRawData } from "../../../core/oferta/model/IOfertaModel";
import { ISemekoDetails } from "./SemekoModel";
import { StronaSwiata } from '../../../core/oferta/model/StronySwiata';

export default async (
    html: string[] | string,
    errors: any[],
): Promise<ISemekoDetails> => {

    if (html instanceof Array) {
        throw new Error('maper przenaczony dla pojedynczego rekordu, otrzymano tablicę');
    }

    const root = parse(html);

    const stronySwiata = getKierunkiSwiata(root, errors) || [];
    const zasobyDoPobrania = getZasobyDoPobrania(root, errors);

    return { stronySwiata, zasobyDoPobrania };
}

function getKierunkiSwiata(root: HTMLElement | undefined, errors: any[]): Array<StronaSwiata | IRawData> | undefined {
    const kierunkiSwiataEl = root?.querySelectorAll('#KartaBox')
        .filter(i => i.querySelector('div.Left')?.text === 'Strony świata')
        .shift();

    const kierunkiSwiata = kierunkiSwiataEl?.querySelectorAll('div.Right span')?.map(s => s.text);

    return kierunkiSwiata
        ? kierunkiSwiata.map(kierunkiSwiataMapper)
        : undefined;
}

function kierunkiSwiataMapper(raw: string): StronaSwiata | IRawData {
    switch (raw) {
        case 'pn': return StronaSwiata.PÓŁNOC;
        case 'w': return StronaSwiata.WSCHÓD;
        case 'po': return StronaSwiata.POŁUDNIE;
        case 'z': return StronaSwiata.ZACHÓD;
        default: return { raw }
    }
}

function getZasobyDoPobrania(root: HTMLElement | undefined, errors: any[]): { id: string, url: string }[] {
    const result: { id: string, url: string }[] = [];
    const pdfUrlPart = root?.querySelectorAll('div.ButtonsKarta a')
        .filter(a => a.attributes['target'] === '_blank')
        .map(a => a.attributes['href'])
        .shift();

    if (pdfUrlPart) {
        result.push({ id: 'ofertaPdf', url: `https://www.semeko.pl${pdfUrlPart}` })
    }

    return result;
}