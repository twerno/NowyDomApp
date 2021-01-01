import { HTMLElement } from 'node-html-parser';
import { IAsyncTask } from "../../../core/asyncTask/IAsyncTask";
import { ZASOBY } from '../../../core/oferta/model/IOfertaModel';
import { HtmlParser } from '../../utils/HtmlParser';
import { INorthStarDevDataProvider, INorthStarDevParserProps } from './NorthStarDevDataBuilder';
import { INorthStarDevListElement } from './NorthStarDevModel';

export default (rowMapper: NorthStarDevRowMapper) => (
    html: string,
    errors: any[],
    props: INorthStarDevParserProps
): { items: INorthStarDevListElement[], tasks?: IAsyncTask[] } => {

    const root = HtmlParser.parseHtml(html);
    const rows = root.querySelector('#tabela-wyszukaj')?.querySelector('tbody')?.querySelectorAll('tr');

    const items: INorthStarDevListElement[] = rows?.map(
        (row, idx) => {
            const h = new HtmlParser<INorthStarDevListElement>(`${props.dataProvider.inwestycjaId} X ${idx}`, errors);
            return rowMapper(row, h, props.dataProvider);
        }
    );

    return { items };
}

// ****************************
// mapper
// ****************************

export type NorthStarDevRowMapper = (
    row: HTMLElement | undefined,
    h: HtmlParser<INorthStarDevListElement>,
    dataProvider: INorthStarDevDataProvider
) => INorthStarDevListElement;

// function rowMapper(
//     row: HTMLElement | undefined,
//     h: HtmlParser<INorthStarDevListElement>,
//     dataProvider: INorthStarDevDataProvider
// ): INorthStarDevListElement {

//     const cols: HTMLElement[] = row?.querySelectorAll('td') || [];

//     const result: INorthStarDevListElement = {
//         id: 'tmp_id',
//         typ: dataProvider.data.typ,
//         ...h.asFloat('metraz', cols[0], DataParserHelper.float()),
//         ...h.asInt('pietro', cols[1], DataParserHelper.pietro),
//         ...h.asInt('lpPokoj', cols[2]),
//         ...h.asCustom('status', cols[3], DataParserHelper.status),
//         ...h.asString('nrLokalu', cols[4]),
//         ...zasobyDoPobrania(cols[5], h),
//     };

//     result.id = ofertaIdBuilderExcept([dataProvider.inwestycjaId, result.nrLokalu]);

//     return result;
// }

// ****************************
// mapper utils
// ****************************

function zasobyDoPobrania(el: HTMLElement | undefined, h: HtmlParser<INorthStarDevListElement>) {
    const link = el?.querySelector('a');
    const href = h.readAttributeOf(link, 'href', { fieldInfo: 'zasobyDoPobrania', mustExist: false });

    const zasobyDoPobrania = href
        ? [{ id: ZASOBY.IMG, url: href }]
        : [];

    return { zasobyDoPobrania };
}
