import { StronaSwiataHelper } from '@src/core/oferta/model/StronySwiata';
import { HTMLElement } from 'node-html-parser';
import { IAsyncTask } from "../../../core/asyncTask/IAsyncTask";
import { ofertaIdBuilderExcept } from '../../../core/oferta/IOfertaProvider';
import { ZASOBY } from '../../../core/oferta/model/IOfertaModel';
import { HtmlParser } from '../../utils/HtmlParser';
import DataParserHelper from '../../utils/ParserHelper';
import { ILokerDataProvider, ILokerParserProps } from './LokerDataBuilder';
import { ILokerListElement } from './LokerModel';

export default (
    html: string,
    errors: any[],
    props: ILokerParserProps
): { items: ILokerListElement[], tasks?: IAsyncTask[] } => {

    const root = HtmlParser.parseHtml(html);
    const rows = root.querySelector('table')?.querySelector('tbody')?.querySelectorAll('tr');

    const items: ILokerListElement[] = rows?.map(
        (row, idx) => {
            const h = new HtmlParser<ILokerListElement>(`${props.dataProvider.inwestycjaId} X ${idx}`, errors);
            return rowMapper(row, h, props.dataProvider);
        }
    );

    return { items };
}

// ****************************
// mapper
// ****************************

function rowMapper(
    row: HTMLElement | undefined,
    h: HtmlParser<ILokerListElement>,
    dataProvider: ILokerDataProvider
): ILokerListElement {

    const cols: HTMLElement[] = row?.querySelectorAll('td') || [];

    const result: ILokerListElement = {
        id: 'tmp_id',
        typ: dataProvider.data.typ,
        ...h.asString('budynek', cols[0]),
        ...h.asString('nrLokalu', cols[1]),
        ...h.asInt('pietro', cols[2], DataParserHelper.pietro),
        ...h.asInt('lpPokoj', cols[3]),
        ...h.asFloat('metraz', cols[4], DataParserHelper.float()),
        ...stronySwiata(cols[6], h),
        ...h.asCustom('status', cols[7], DataParserHelper.status),
        ...cechy(cols[8], h),
        ...zasobyDoPobrania(cols[9], h),
        ...offerDetailsUrl(cols[0], h),
    };

    result.id = ofertaIdBuilderExcept([dataProvider.inwestycjaId, result.budynek, result.nrLokalu]);

    return result;
}

// ****************************
// mapper utils
// ****************************

function cechy(el: HTMLElement | undefined, h: HtmlParser<ILokerListElement>) {
    const text = h.readTextOf(el, { fieldInfo: 'cechy' });

    return h.asMap('cechy', text?.split(','), DataParserHelper.cecha);
}

const stronySwiataConv = [
    { key: 'Płd', val: 'POŁUDNIE' },
    { key: 'Z', val: 'ZACHÓD' },
    { key: 'Płn', val: 'PÓŁNOC' },
    { key: 'W', val: 'WSCHÓD' },
];

function stronySwiata(el: HTMLElement | undefined, h: HtmlParser<ILokerListElement>) {
    const text = h.readTextOf(el, { fieldInfo: 'stronySwiata' });
    const stronySwiataList = text?.split(',')
        .map(v => stronySwiataConv
            .find(s => s.key === v.trim())?.val ?? v)

    return h.asList('stronySwiata', stronySwiataList, StronaSwiataHelper.raw2StronaSwiata);
}

function zasobyDoPobrania(el: HTMLElement | undefined, h: HtmlParser<ILokerListElement>) {
    const link = el?.querySelector('a.pdflink');
    const href = h.readAttributeOf(link, 'href', { fieldInfo: 'stronySwiata' });

    return {
        zasobyDoPobrania: href ?
            [{ id: ZASOBY.PDF, url: `http://www.loker.com.pl/${href}` }]
            : []
    }
}

function offerDetailsUrl(el: HTMLElement | undefined, h: HtmlParser<ILokerListElement>) {
    const text = h.readAttributeOf(el, 'onclick', { fieldInfo: 'offerDetailsUrl' });
    const link = text?.replace("'", '')
        .replace("document.location.href=", '');

    return link
        ? { offerDetailsUrl: `http://www.loker.com.pl${link}` }
        : { offerDetailsUrl: undefined };
}
