import { HTMLElement } from 'node-html-parser';
import { IAsyncTask } from "../../../core/asyncTask/IAsyncTask";
import { ofertaIdBuilderExcept } from '../../../core/oferta/IOfertaProvider';
import { HtmlParser } from '../../helpers/HtmlParser';
import DataParserHelper from '../../helpers/ParserHelper';
import { IOrlexDataProvider, IOrlexParserProps } from './OrlexDataBuilder';
import { IOrlexListElement } from './OrlexModel';
import { ZASOBY } from '@src/core/oferta/model/IOfertaModel';

export default (
    html: string,
    errors: any[],
    props: IOrlexParserProps
): { items: IOrlexListElement[], tasks?: IAsyncTask[] } => {

    const root = HtmlParser.parseHtml(html);
    const rows = root.querySelectorAll('div.flat-item');

    const items: IOrlexListElement[] = rows?.map(
        (row, idx) => {
            const h = new HtmlParser<IOrlexListElement>(`${props.dataProvider.inwestycjaId} X ${idx}`, errors);
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
    h: HtmlParser<IOrlexListElement>,
    dataProvider: IOrlexDataProvider
): IOrlexListElement {

    const infoList = row?.querySelector('div.big-flex-info').querySelectorAll('div.div-flex-mini-info');
    const infoListFinder =
        (caption: string) => infoList?.find(e => e.querySelector('h5.bolde').text === caption);
    const statusEl = infoListFinder('status')?.querySelectorAll('h5')
        .find(e => e.classNames.indexOf('number') >= 0 && e.classNames.indexOf('w-condition-invisible') === -1);

    const cols: HTMLElement[] = row?.querySelectorAll('a') || [];

    const result: IOrlexListElement = {
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

function zasobyDoPobrania(row: HTMLElement | undefined, h: HtmlParser<IOrlexListElement>): { id: string, url: string }[] {
    const pdfLink = h.readAttributeOf(
        row?.querySelector('a.dyn_link_card'),
        'href',
        { fieldInfo: { fieldName: 'zasobyDoPobrania', comment: 'pdfLink' } }
    );
    const imgLink = h.readAttributeOf(
        row?.querySelector('div.link-block-photo').querySelector('img.img-rzut-inv'),
        'src',
        { fieldInfo: { fieldName: 'zasobyDoPobrania', comment: 'imgLink' } }
    );
    const result: { id: string, url: string }[] = [];

    if (pdfLink) {
        result.push({ id: ZASOBY.PDF, url: pdfLink });
    }

    if (imgLink) {
        result.push({ id: ZASOBY.IMG, url: imgLink });
    }

    return result;
}

function offerDetailsUrl(row: HTMLElement | undefined, h: HtmlParser<IOrlexListElement>) {
    const detailsUrl = h.readAttributeOf(row?.querySelector('a.div-name'), 'href', { fieldInfo: 'offerDetailsUrl' });
    if (detailsUrl) {
        // na stronie z detalami nie ma nic ciekawego
        // return `https://www.orlexinvest.pl${detailsUrl}`;
    }
    return undefined;
}