import { HTMLElement, parse } from 'node-html-parser';
import { IDataProvider, ISubTaskProps } from "../../../dataProvider/IOfertaProvider";
import { ICechy, IRawData, Status, OdbiorType } from "../../../dataProvider/IOfertaRecord";
import ProvideOfferTask1 from "../../../dataProvider/ProvideOfferTask1";
import { IAsyncTask } from "../../../utils/asyncTask/IAsyncTask";
import NodeHtmlParserHelper from '../../../utils/NodeHtmlParserHelper';
import { ISemekoDetails, ISemekoListElement } from "./SemekoModel";
import { HtmlParserHelper } from './HtmlParserHelper';

export default (
    html: string,
    errors: any[],
    subTaskProps: ISubTaskProps<ISemekoListElement, ISemekoDetails>
): { items: ISemekoListElement[], tasks?: IAsyncTask[] } => {

    const root = parse(html);
    const rows = root.querySelectorAll('div.table-list .row');
    const tooltips = root.querySelector('#mystickytooltip');

    const items: ISemekoListElement[] = [];

    rows.forEach((row, idx) => {
        items.push(rowMapper(idx, row, tooltips, errors, subTaskProps.dataProvider))
    });

    const tasks = buildPostTasks(root, subTaskProps, errors);

    return { items, tasks };
}

function rowMapper(
    rowIdx: number,
    row: HTMLElement | undefined,
    tooltips: HTMLElement | undefined,
    errors: any[],
    dataProvider: IDataProvider<ISemekoListElement, ISemekoDetails>
): ISemekoListElement {

    const zasobyDoPobrania = getZasobyDoPobrania(row, tooltips, errors);
    const h = new HtmlParserHelper<ISemekoListElement>(`${dataProvider.inwestycjaId} X ${rowIdx}`, errors);

    const result: ISemekoListElement = {
        id: 'tmp_id',
        ...h.asString('budynek', row?.querySelector('.c1')),
        ...h.asString('nrLokalu', row?.querySelector('.c2')),
        ...h.asInt('pietro', row?.querySelector('.c3')),
        ...h.asFloat('metraz', row?.querySelector('.c5')),
        ...h.asInt('liczbaPokoi', row?.querySelector('.c6')),
        ...h.asCustom('odbior', row?.querySelector('.c7'), { mapper: odbiorMapper }),
        status: Status.WOLNE,
        ...h.asMap("cechy", row?.querySelectorAll('.c9 span.more4'), cechaParser),

        detailsUrl: getDetailsUrl(row?.querySelector('.c1'), errors),
        zasobyDoPobrania,
    };

    result.id = `${dataProvider.inwestycjaId}-${result.budynek}-${result.nrLokalu}`;

    return result;
}

function odbiorMapper(raw: string | null): OdbiorType | null {
    const exprResult = /(\d{4})-(\d{2})/.exec(raw || '');

    if (!exprResult || !exprResult[1]) {
        return { raw };
    }

    const rok = Number.parseInt(exprResult[1]);
    const miesiac = Number.parseInt(exprResult[2]);

    if (isNaN(miesiac) || isNaN(rok)) {
        return { raw };
    }

    return { miesiac, rok };
}

function cechaParser(raw: string): { data: Partial<ICechy> } | IRawData | null {
    switch (raw) {
        case 'o': return { raw: 'ogród' };
        case 't/o': return { raw: 'taras/ogród' };
        case 'b': return { raw: 'balkon' };
        case 'a': return { raw: 'antresola' };
        case 'l': return { raw: 'loggia' };
        default: return null;
    }
}

function getDetailsUrl(el: HTMLElement | undefined, errors: any[]) {
    const urlPart = el?.attributes['onclick'];
    const exprResult = /location\.href=\'(.+)'/.exec(urlPart || '');

    if (exprResult && exprResult[1]) {
        return `https://www.semeko.pl${exprResult[1]}`;
    }

    return '';
}

function getMiniaturkaUrl(el: HTMLElement | undefined, tooltips: HTMLElement | undefined, errors: any[]) {
    const dataTooltip = el?.querySelector('a')?.attributes['data-tooltip']
    const src = tooltips?.querySelector(`[id='${dataTooltip}']`)?.querySelector('img')?.attributes['src'];

    return src
        ? `https://www.semeko.pl${src}`
        : undefined;
}

function getNextPageUrl(root: HTMLElement | undefined, errors: any[]) {
    const urlPart = root?.querySelector('div.next a')?.attributes['onclick'];
    const exprResult = /='(.+)';/.exec(urlPart || '');

    if (exprResult && exprResult[1]) {
        return `https://www.semeko.pl${exprResult[1]}`;
    }

    return null;
}

function buildPostTasks(
    root: HTMLElement | undefined,
    subTaskProps: ISubTaskProps<ISemekoListElement, ISemekoDetails>,
    errors: any[]) {
    const nextPageUrl = getNextPageUrl(root, errors);

    return nextPageUrl
        ? [new ProvideOfferTask1({ ...subTaskProps.dataProvider, getListUrl: () => nextPageUrl }, subTaskProps.priority)]
        : [];
}

function getZasobyDoPobrania(row: HTMLElement | undefined, tooltips: HTMLElement | undefined, errors: any[]) {
    const result: { id: string, url: string }[] = [];

    const miniaturkaUrl = getMiniaturkaUrl(row?.querySelector('.c111'), tooltips, errors);
    if (miniaturkaUrl) {
        result.push({ id: 'miniaturka', url: miniaturkaUrl })
    }

    return result;
}