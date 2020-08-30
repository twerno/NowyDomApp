import { IZaciszeParserProps } from "./ZaciszeDataBuilder";
import { IZaciszeOfferDetails } from "./ZaciszeModel";
import { HtmlParser } from "@src/inwestycje/helpers/HtmlParser";
import { ZASOBY } from "@src/core/oferta/model/IOfertaModel";

export default async function (
    html: string | string[],
    errors: any[],
    offerId: string,
    props: IZaciszeParserProps
): Promise<IZaciszeOfferDetails> {

    if (html instanceof Array) {
        throw new Error('maper przenaczony dla pojedynczego rekordu, otrzymano tablicę');
    }

    const root = HtmlParser.parseHtml(html);
    const h = new HtmlParser<IZaciszeOfferDetails>(offerId, errors);
    const zasobyDoPobrania: { id: string, url: string }[] = [];

    const planMieszkaniaElement = root.querySelector('#content')?.querySelector('img');
    const planMieszkaniaUrl = h.readAttributeOf(planMieszkaniaElement, 'src', { fieldInfo: { fieldName: 'zasobyDoPobrania', comment: 'planMieszkania' } });
    if (planMieszkaniaUrl) {
        zasobyDoPobrania.push({ id: ZASOBY.IMG, url: `https://osiedle-zacisze.com.pl/${planMieszkaniaUrl}` });
    }

    const planGarazuElement = root.querySelector('#section.feature')?.querySelector('img');
    const planGarazuUrl = h.readAttributeOf(planGarazuElement, 'src', { fieldInfo: { fieldName: 'zasobyDoPobrania', comment: 'planGarazu' }, mustExist: false });
    if (planGarazuUrl) {
        zasobyDoPobrania.push({ id: ZASOBY.IMG + "-2", url: `https://osiedle-zacisze.com.pl/${planGarazuUrl}` });
    }

    return { zasobyDoPobrania };
}