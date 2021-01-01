import { HTMLElement } from 'node-html-parser';
import { ZASOBY } from '../../../core/oferta/model/IOfertaModel';
import { HtmlParser } from '../../utils/HtmlParser';
import { IEuroStylOfferDetails } from './EuroStylModel';
import { IEuroStylParserProps } from './EuroStylDataBuilder';
import ParserHelper from '@src/inwestycje/utils/ParserHelper';

export default async (
    html: string[] | string,
    errors: any[],
    offerId: string,
    props: IEuroStylParserProps
): Promise<IEuroStylOfferDetails> => {

    if (html instanceof Array) {
        throw new Error('maper przenaczony dla pojedynczego rekordu, otrzymano tablicę');
    }

    const root = HtmlParser.parseHtml(html);
    const rows = root.querySelector('ul.house-info')?.querySelectorAll('li');

    const h = new HtmlParser<IEuroStylOfferDetails>(`Detale: ${props.dataProvider.inwestycjaId} x ${offerId}`, errors);

    const zasobyDoPobrania = getZasobyDoPobrania(root, h);

    return {
        ...h.asFloatOptional('cena', findRowByName(rows, 'CENA BRUTTO'), ParserHelper.cena(/(-?[\d,.\s]+) zł/)),
        ...h.asText('budynek', findRowByName(rows, 'BUDYNEK')),
        zasobyDoPobrania,
    };
}

function getZasobyDoPobrania(root: HTMLElement | undefined, h: HtmlParser<IEuroStylOfferDetails>): { id: string, url: string }[] {
    const result: { id: string, url: string }[] = [];

    const pdfUrlPart = h.readAttributeOf(
        root?.querySelector('.tab-content').querySelector('a.download-btn'),
        'href',
        { fieldInfo: { comment: ZASOBY.PDF } })


    if (pdfUrlPart) {
        result.push({ id: ZASOBY.PDF, url: `https://www.eurostyl.com.pl${pdfUrlPart}` })
    }

    const imgUrlPart = h.readAttributeOf(
        root?.querySelector('div.house-card-image-container').querySelector('a'),
        'href',
        { fieldInfo: { comment: ZASOBY.PDF } });


    if (imgUrlPart) {
        result.push({ id: ZASOBY.IMG, url: `https://www.eurostyl.com.pl${imgUrlPart}` })
    }

    return result;
}

function findRowByName(rows: HTMLElement[] | undefined, name: string) {
    for (const row of rows || []) {
        const rowName = row?.querySelector('span.name')?.structuredText;
        if (rowName?.toLocaleLowerCase() === name.toLocaleLowerCase()) {
            return row?.querySelector('span.info');
        }
    }
    return undefined;
}