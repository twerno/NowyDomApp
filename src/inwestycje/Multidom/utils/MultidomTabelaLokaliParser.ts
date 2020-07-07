import { HTMLElement, parse } from 'node-html-parser';
import { IAsyncTask } from "../../../core/asyncTask/IAsyncTask";
import { ICechy } from '../../../core/oferta/model/IOfertaModel';
import DataParserHelper from '../../helpers/ParserHelper';
import { HtmlParserHelper } from '../../helpers/HtmlParser';
import { IMultiDomDataProvider, IMultiDomParserProps } from './MultidomDataProviderBuilder';
import { IMultiDomListElement } from './MultidomModel';
import { ofertaIdBuilderExcept } from '../../../core/oferta/IOfertaProvider';

export default (
    html: string,
    errors: any[],
    props: IMultiDomParserProps
): { items: IMultiDomListElement[], tasks?: IAsyncTask[] } => {

    const root = parse(html);
    const rows = root.querySelector('table.table__table').querySelectorAll('tr.positionsFilters');

    const items: IMultiDomListElement[] = rows.map(
        (row, idx) => {
            const h = new HtmlParserHelper<IMultiDomListElement>(`${props.dataProvider.inwestycjaId} X ${idx}`, errors);
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
    h: HtmlParserHelper<IMultiDomListElement>,
    dataProvider: IMultiDomDataProvider
): IMultiDomListElement {

    const result: IMultiDomListElement = {
        id: 'tmp_id',
        typ: dataProvider.data.typ,
        ...h.asStringOptional('budynek', row?.querySelector('td.building'), DataParserHelper.regExp(/Budynek:\s*(\w+)/)),
        ...h.asString('nrLokalu', row?.querySelector('td.local'), DataParserHelper.regExp(/Lokal:\s*(\w+)/)),

        ...h.asFloat('metraz', row?.querySelector('td.area')),
        ...h.asInt('pietro', row?.querySelector('td.position'), DataParserHelper.pietro),
        ...h.asInt('lpPokoj', row?.querySelector('td.rooms'), DataParserHelper.int(/Pokoje:\s*(\d+)/)),
        ...h.asFloatOptional('cena', row?.querySelector('td.price'), DataParserHelper.floatOptional()),

        ...h.asCustom('status', row?.querySelector('td.status'), DataParserHelper.status),

        ...h.asMap('cechy', row?.querySelector('td.options')?.structuredText?.split(',')?.map(v => v.trim()), cechaParser),
        ...h.asStringOptional("offerDetailsUrl", row?.querySelector('td.view')?.querySelector('a'), detailsUrlParser, { attributeName: 'href' }),
    };

    result.id = ofertaIdBuilderExcept([dataProvider.inwestycjaId, result.budynek, result.nrLokalu]);

    return result;
}

// ****************************
// mapper utils
// ****************************

function cechaParser(source: string | undefined | null): Partial<ICechy> | string | null {
    return null;
}

function detailsUrlParser(source: string | null | undefined) {
    if (source === null || source === undefined || source === '') {
        return null;
    }

    return `https://multidom.pl${source}`;
}

