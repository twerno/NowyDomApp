import { HTMLElement } from 'node-html-parser';
import { IAsyncTask } from "../../../core/asyncTask/IAsyncTask";
import { ICechy } from '../../../core/oferta/model/ICechy';
import DataParserHelper from '../../utils/ParserHelper';
import { HtmlParser } from '../../utils/HtmlParser';
import { ofertaIdBuilderExcept } from '../../../core/oferta/IOfertaProvider';
import { IEuroStylListElement } from './EuroStylModel';
import { IEuroStylParserProps, IEuroStylDataProvider } from './EuroStylDataBuilder';
import { OdbiorType } from '@src/core/oferta/model/OdbiorType';
import CommConv from '@src/inwestycje/utils/CommConv';
import { Status } from '@src/core/oferta/model/Status';
import { StronaSwiataHelper } from '@src/core/oferta/model/StronySwiata';

export default (
    html: string,
    errors: any[],
    props: IEuroStylParserProps
): { items: IEuroStylListElement[], tasks?: IAsyncTask[] } => {

    const root = HtmlParser.parseHtml(html);
    const rows = root.querySelector('table')?.querySelectorAll('tr.content');

    const items: IEuroStylListElement[] = rows?.map(
        (row, idx) => {
            const h = new HtmlParser<IEuroStylListElement>(`${props.dataProvider.inwestycjaId} X ${idx}`, errors);
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
    h: HtmlParser<IEuroStylListElement>,
    dataProvider: IEuroStylDataProvider
): IEuroStylListElement {

    const cols: HTMLElement[] = row?.querySelectorAll('td') || [];

    const result: IEuroStylListElement = {
        id: 'tmp_id',
        typ: dataProvider.data.typ,
        status: Status.WOLNE,
        ...h.asString('nrLokalu', cols[0]),
        ...h.asInt('pietro', cols[1], DataParserHelper.pietro),
        ...h.asFloat('metraz', cols[2], DataParserHelper.float()),
        ...h.asInt('lpPokoj', cols[3]),
        ...h.asCustom('odbior', cols[4], odbiorMapper),
        ...h.asMap('cechy', cols[5]?.querySelectorAll('span'), cechaParser, { mustExist: false }),
        ...h.asList('stronySwiata', cols[6]?.querySelectorAll('span'), StronaSwiataHelper.raw2StronaSwiata),
        ...h.asStringOptional("offerDetailsUrl", cols.find(c => c.querySelector('a.kartaLink'))?.querySelector('a.kartaLink'), detailsUrlParser, { attributeName: 'href' }),
    };

    result.id = ofertaIdBuilderExcept([dataProvider.inwestycjaId, result.nrLokalu]);

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

    return 'https://www.eurostyl.com.pl'
        + source.replace(/&return_url.+?$/, '')
        + '&return_url=%2fofertyspecjalne%2ehtml';
}

function odbiorMapper(raw: string | null | undefined): OdbiorType | null {
    if (raw === null || raw === undefined) {
        return null;
    }

    const exprResult = /^(\w+) kw. (\d{4})/.exec(raw || '');

    if (!exprResult || !exprResult[1]) {
        return { raw };
    }

    const kwartal = CommConv.rzymskie2arabskie(exprResult[1]);
    const rok = Number.parseInt(exprResult[2]);

    if (kwartal === null || isNaN(rok)) {
        return { raw };
    }

    return { kwartal, rok };
}
