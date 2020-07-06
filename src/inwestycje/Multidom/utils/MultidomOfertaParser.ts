import { HTMLElement, parse } from 'node-html-parser';
import { IDataProviderParserProps } from '../../../core/oferta/IOfertaProvider';
import { HtmlParserHelper } from '../../../inwestycje/helpers/HtmlParserHelper';
import { IMultidomDetails, IMultiDomListElement } from './MultidomModel';
import { ZASOBY } from '../../../core/oferta/model/IOfertaModel';
import { IMultiDomParserProps } from './MultidomDataProviderBuilder';

export default async (
    html: string[] | string,
    errors: any[],
    offerId: string,
    props: IMultiDomParserProps
): Promise<IMultidomDetails> => {

    if (html instanceof Array) {
        throw new Error('maper przenaczony dla pojedynczego rekordu, otrzymano tablicę');
    }

    const root = parse(html);

    const h = new HtmlParserHelper<IMultidomDetails>(`Detale: ${props.dataProvider.inwestycjaId} x ${offerId}`, errors);

    const zasobyDoPobrania = getZasobyDoPobrania(root, h);

    return { zasobyDoPobrania };
}

function getZasobyDoPobrania(root: HTMLElement | undefined, h: HtmlParserHelper<IMultidomDetails>): { id: string, url: string }[] {
    const result: { id: string, url: string }[] = [];

    const pdfUrlPart = h.readAttributeOf(
        root?.querySelector('div.view__show').querySelector('a'),
        'href',
        { fieldInfo: { comment: ZASOBY.PDF } })


    if (pdfUrlPart) {
        result.push({ id: ZASOBY.PDF, url: `https://multidom.pl${pdfUrlPart}` })
    }

    const imgUrlPart = h.readAttributeOf(
        root?.querySelector('div.view__img').querySelector('img'),
        'src',
        { fieldInfo: { comment: ZASOBY.PDF } });


    if (imgUrlPart) {
        result.push({ id: ZASOBY.IMG, url: `https://multidom.pl${imgUrlPart}` })
    }

    return result;
}