import { HTMLElement } from 'node-html-parser';
import { IAsyncTask } from "../../../core/asyncTask/IAsyncTask";
import { ofertaIdBuilderExcept } from '../../../core/oferta/IOfertaProvider';
import { HtmlParser } from '../../helpers/HtmlParser';
import DataParserHelper from '../../helpers/ParserHelper';
import { IHSDomDataProvider, IHSDomParserProps } from './HSDom';
import { IHSDomListElement } from './HSDomModel';

export default (
    html: string,
    errors: any[],
    props: IHSDomParserProps
): { items: IHSDomListElement[], tasks?: IAsyncTask[] } => {

    const root = HtmlParser.parseHtml(html);
    const rows = root.querySelectorAll('div.table-body');

    const items: IHSDomListElement[] = rows?.map(
        (row, idx) => {
            const h = new HtmlParser<IHSDomListElement>(`${props.dataProvider.inwestycjaId} X ${idx}`, errors);
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
    h: HtmlParser<IHSDomListElement>,
    dataProvider: IHSDomDataProvider
): IHSDomListElement {

    const cols: HTMLElement[] = row?.querySelectorAll('div.table-item') || [];

    const result: IHSDomListElement = {
        id: 'tmp_id',
        typ: dataProvider.data.typ,
        ...h.asString('budynek', cols[0], DataParserHelper.regExp(/Budynek (\d+)/)),
        ...h.asString('nrLokalu', cols[1]),
        ...h.asInt('pietro', cols[2], DataParserHelper.pietro),
        ...h.asFloat('metraz', cols[3], DataParserHelper.float()),
        ...h.asInt('lpPokoj', cols[4]),
        ...h.asCustom('status', cols[5], DataParserHelper.status),
        ...h.asFloat('cena', cols[6], DataParserHelper.cena()),
        ...offerDetailsUrl(cols[8], h),
    };

    result.id = ofertaIdBuilderExcept([dataProvider.inwestycjaId, result.budynek, result.nrLokalu]);

    return result;
}

// ****************************
// mapper utils
// ****************************

function offerDetailsUrl(el: HTMLElement | undefined, h: HtmlParser<IHSDomListElement>) {
    const url = h.readAttributeOf(el?.querySelector('a'), 'href', { fieldInfo: 'offerDetailsUrl' });

    return url
        ? { offerDetailsUrl: url }
        : { offerDetailsUrl: undefined };
}
