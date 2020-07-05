import { HTMLElement, parse } from 'node-html-parser';
import { IAsyncTask } from "../../../core/asyncTask/IAsyncTask";
import { IDataProvider, IParseListProps } from "../../../core/oferta/IOfertaProvider";
import { ICechy } from '../../../core/oferta/model/IOfertaModel';
import DataParserHelper from '../../../inwestycje/helpers/DataParserHelper';
import { HtmlParserHelper } from '../../../inwestycje/helpers/HtmlParserHelper';
import { IMultidomDetails, IMultiDomListElement } from './MultidomModel';

export default (
    html: string,
    errors: any[],
    subTaskProps: IParseListProps<IMultiDomListElement, IMultidomDetails>
): { items: IMultiDomListElement[], tasks?: IAsyncTask[] } => {

    const root = parse(html);
    const rows = root.querySelector('table.table__table').querySelectorAll('tr.positionsFilters');

    const items: IMultiDomListElement[] = rows.map(
        (row, idx) => {
            const h = new HtmlParserHelper<IMultiDomListElement>(`${subTaskProps.dataProvider.inwestycjaId} X ${idx}`, errors);
            return rowMapper(row, h, subTaskProps.dataProvider);
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
    dataProvider: IDataProvider<IMultiDomListElement, IMultidomDetails>
): IMultiDomListElement {

    const a = h.asMap('cechy', row?.querySelector('td.options')?.structuredText?.split(',')?.map(v => v.trim()), cechaParser);

    const result: IMultiDomListElement = {
        id: 'tmp_id',
        ...h.asStringOptional('budynek', row?.querySelector('td.building')),
        ...h.asString('nrLokalu', row?.querySelector('td.local'), DataParserHelper.regExp(/Lokal:\s*(\w+)/)),

        ...h.asFloat('metraz', row?.querySelector('td.area')),
        ...h.asInt('pietro', row?.querySelector('td.position'), DataParserHelper.pietro),
        ...h.asInt('lpPokoj', row?.querySelector('td.rooms'), DataParserHelper.int(/Pokoje:\s*(\d+)/)),
        ...h.asFloatOptional('cena', row?.querySelector('td.price'), DataParserHelper.floatOptional()),

        ...h.asCustom('status', row?.querySelector('td.status'), DataParserHelper.status),

        ...h.asMap('cechy', row?.querySelector('td.options')?.structuredText?.split(',')?.map(v => v.trim()), cechaParser),
        ...h.asStringOptional("detailsUrl", row?.querySelector('td.view')?.querySelector('a'), detailsUrlParser, { attributeName: 'href' }),
    };

    result.id = `${dataProvider.inwestycjaId}-${result.budynek}-${result.nrLokalu}`;

    return result;
}

// ****************************
// mapper utils
// ****************************

function cechaParser(source: string | undefined | null): Partial<ICechy> | string | null {
    switch (source) {
        case 'o': return 'ogród';
        case 't/o': return 'taras/ogród';
        case 'b': return 'balkon';
        case 'a': return 'antresola';
        case 'l': return 'loggia';
    }
    return null;
}

function detailsUrlParser(source: string | null | undefined) {
    if (source === null || source === undefined || source === '') {
        return null;
    }

    return `https://multidom.pl${source}`;
}

