import { HTMLElement } from 'node-html-parser';
import { IAsyncTask } from "../../../core/asyncTask/IAsyncTask";
import { ofertaIdBuilderExcept } from '../../../core/oferta/IOfertaProvider';
import { HtmlParser } from '../../utils/HtmlParser';
import DataParserHelper from '../../utils/ParserHelper';
import { IOrlexInvestDataProvider, IOrlexInvestParserProps } from './OrlexInvestDataBuilder';
import { IOrlexInvestListElement } from './OrlexInvestModel';
import { ZASOBY } from '@src/core/oferta/model/IOfertaModel';

export default (
    html: string,
    errors: any[],
    props: IOrlexInvestParserProps
): { items: IOrlexInvestListElement[], tasks?: IAsyncTask[] } => {

    const root = HtmlParser.parseHtml(html);
    const rows = root.querySelectorAll('div.flat-item');

    const items: IOrlexInvestListElement[] = rows?.map(
        (row, idx) => {
            const h = new HtmlParser<IOrlexInvestListElement>(`${props.dataProvider.inwestycjaId} X ${idx}`, errors);
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
    h: HtmlParser<IOrlexInvestListElement>,
    dataProvider: IOrlexInvestDataProvider
): IOrlexInvestListElement {

    const infoList = row?.querySelector('div.big-flex-info').querySelectorAll('div.div-flex-mini-info');
    const infoListFinder =
        (caption: string) => infoList?.find(e => e.querySelector('h5.bolde').text === caption);
    const statusEl = infoListFinder('status')?.querySelectorAll('h5')
        .find(e => e.classNames.indexOf('number') >= 0 && e.classNames.indexOf('w-condition-invisible') === -1);

    const cols: HTMLElement[] = row?.querySelectorAll('a') || [];

    const result: IOrlexInvestListElement = {
        id: 'tmp_id',
        typ: dataProvider.data.typ,
        budynek: dataProvider.data.budynek,
        ...h.asString('nrLokalu', cols[1], DataParserHelper.regExp(/\s(.+)$/)),
        ...h.asInt('pietro', infoListFinder('piętro')?.querySelector('h5.number'), DataParserHelper.pietro),
        ...h.asInt('lpPokoj', infoListFinder('liczba pokoi')?.querySelector('h5.number')),
        ...h.asInt('pietro', infoListFinder('piętro')?.querySelector('h5.number')),
        ...h.asFloat('metraz', infoListFinder('powierzchnia')?.querySelector('h5.number.mar'), DataParserHelper.float()),
        ...h.asFloatOptional('cena', infoListFinder('cena brutto')?.querySelector('h5.currency'), DataParserHelper.cena(/(-?[\d,.\s]+)/)),
        ...h.asCustom('status', statusEl, DataParserHelper.status),
        zasobyDoPobrania: zasobyDoPobrania(row, h),
        offerDetailsUrl: offerDetailsUrl(row, h)
    };

    result.id = ofertaIdBuilderExcept([dataProvider.inwestycjaId, result.budynek, result.nrLokalu]);

    return result;
}

// ****************************
// mapper utils
// ****************************

function zasobyDoPobrania(row: HTMLElement | undefined, h: HtmlParser<IOrlexInvestListElement>): { id: string, url: string }[] {
    // const pdfLink = h.readAttributeOf(
    //     row?.querySelector('a.dyn_link_card'),
    //     'href',
    //     { fieldInfo: { fieldName: 'zasobyDoPobrania', comment: 'pdfLink' } }
    // );
    const imgLink = h.readAttributeOf(
        row?.querySelector('div.link-block-photo').querySelector('img.img-rzut-inv'),
        'src',
        { fieldInfo: { fieldName: 'zasobyDoPobrania', comment: 'imgLink' } }
    );
    const result: { id: string, url: string }[] = [];

    // pdf siedzą na google drive - pobieranie problematyczne
    // if (pdfLink) {
    //     result.push({ id: ZASOBY.PDF, url: pdfLink });
    // }

    if (imgLink) {
        result.push({ id: ZASOBY.IMG, url: imgLink });
    }

    return result;
}

function offerDetailsUrl(row: HTMLElement | undefined, h: HtmlParser<IOrlexInvestListElement>) {
    const detailsUrl = h.readAttributeOf(row?.querySelector('a.div-name'), 'href', { fieldInfo: 'offerDetailsUrl' });
    if (detailsUrl) {
        return `https://www.orlexinvest.pl${detailsUrl}`;
    }
    return undefined;
}