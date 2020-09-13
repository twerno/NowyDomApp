import { ZASOBY } from "@src/core/oferta/model/IOfertaModel";
import { HtmlParser } from "@src/inwestycje/helpers/HtmlParser";
import { IHSDomParserProps } from "./HSDom";
import { IHSDomOfferDetails } from "./HSDomModel";

export default async function (
    html: string | string[],
    errors: any[],
    offerId: string,
    props: IHSDomParserProps
): Promise<IHSDomOfferDetails> {

    if (html instanceof Array) {
        throw new Error('maper przenaczony dla pojedynczego rekordu, otrzymano tablicę');
    }

    const root = HtmlParser.parseHtml(html);
    const h = new HtmlParser<IHSDomOfferDetails>(offerId, errors);
    const zasobyDoPobrania: { id: string, url: string | string[] }[] = [];

    // const planMieszkaniaElement = root.querySelector('div.-js-bottom-2d')?.querySelector('img');
    // const planMieszkaniaUrl = h.readAttributeOf(planMieszkaniaElement, 'src', { fieldInfo: { fieldName: 'zasobyDoPobrania', comment: 'planMieszkania' } });
    // if (planMieszkaniaUrl) {
    //     zasobyDoPobrania.push({ id: ZASOBY.IMG, url: planMieszkaniaUrl });
    // }

    const planMieszkania3DElement = root.querySelector('div.-js-bottom-3d')?.querySelector('img');
    const planMieszkania3DUrl = h.readAttributeOf(planMieszkania3DElement, 'src', { fieldInfo: { fieldName: 'zasobyDoPobrania', comment: 'wizualizacja' } });
    if (planMieszkania3DUrl) {
        zasobyDoPobrania.push({ id: ZASOBY.IMG_WIZUALIZACJA, url: planMieszkania3DUrl });
    }

    const kartaPdfElement = root.querySelector('div.single-offer-box')?.querySelectorAll('a')
        .find(a => a.structuredText.includes('Pobierz kartę PDF'));
    const kartaPdfElementUrl = h.readAttributeOf(kartaPdfElement, 'href', { fieldInfo: { fieldName: 'zasobyDoPobrania', comment: 'pdf' } });
    if (kartaPdfElementUrl) {
        zasobyDoPobrania.push({ id: ZASOBY.PDF, url: kartaPdfElementUrl });
    }

    return { zasobyDoPobrania };
}