import { ZASOBY } from "@src/core/oferta/model/IOfertaModel";
import { StronaSwiataHelper } from "@src/core/oferta/model/StronySwiata";
import { HtmlParser } from "@src/inwestycje/helpers/HtmlParser";
import ParserHelper from "@src/inwestycje/helpers/ParserHelper";
import { IDomapartParserProps } from "./Domapart";
import { IDomapartOfferDetails } from "./DomapartModel";

export default async function (
    html: string | string[],
    errors: any[],
    offerId: string,
    props: IDomapartParserProps
): Promise<IDomapartOfferDetails> {

    if (html instanceof Array) {
        throw new Error('maper przenaczony dla pojedynczego rekordu, otrzymano tablicę');
    }

    const root = HtmlParser.parseHtml(html);
    const h = new HtmlParser<IDomapartOfferDetails>(offerId, errors);
    const zasobyDoPobrania: { id: string, url: string | string[] }[] = [];

    const wiersze = root.querySelector('div.table').querySelectorAll('div');

    const cechy = wiersze
        .filter(wiersz => wiersz?.querySelectorAll('div')[0]?.text === "Wartości dodane")
        .map(wiersz => wiersz?.querySelectorAll('div')[1]?.text.split(","))
        .reduce((prev, curr) => [...prev, ...curr], []) || [];

    const strony_swiata = wiersze
        .filter(wiersz => wiersz?.querySelectorAll('div')[0]?.text === "Strony świata")
        .map(wiersz => wiersz?.querySelectorAll('div')[1]?.text.split(","))
        .reduce((prev, curr) => [...prev, ...curr], []) || [];

    ;

    const planJpg = root.querySelector('a.gallery-image');
    const planMieszkaniaUrl = h.readAttributeOf(planJpg, 'href', { fieldInfo: { fieldName: 'zasobyDoPobrania', comment: 'plan' } });
    if (planMieszkaniaUrl) {
        zasobyDoPobrania.push({ id: ZASOBY.IMG, url: props.dataProvider.url + planMieszkaniaUrl });
    }

    const kartaPdfElement = root.querySelector('div.link.g__button')?.querySelectorAll('a')
        .find(a => a.structuredText.includes('Pobierz pdf'));
    const kartaPdfElementUrl = h.readAttributeOf(kartaPdfElement, 'href', { fieldInfo: { fieldName: 'zasobyDoPobrania', comment: 'pdf' } });
    if (kartaPdfElementUrl) {
        zasobyDoPobrania.push({ id: ZASOBY.PDF, url: props.dataProvider.url + kartaPdfElementUrl });
    }

    return {
        zasobyDoPobrania,
        ...h.asMap('cechy', cechy, ParserHelper.cecha),
        ...h.asList('stronySwiata', strony_swiata, StronaSwiataHelper.raw2StronaSwiata),
    };
}