import { HTMLElement, parse } from 'node-html-parser';
import { IDataProvider, IParseListProps } from "../../../core/oferta/IOfertaProvider";
import { ICechy, IRawData } from "../../../core/oferta/model/IOfertaModel";
import ProvideOfferTask1 from "../../../core/oferta/tasks/ProvideOfferTask1";
import { IAsyncTask } from "../../../core/asyncTask/IAsyncTask";
import { HtmlParserHelper } from '../../../core/utils/HtmlParserHelper';
import { ISemekoDetails, ISemekoListElement } from "./SemekoModel";
import { Status } from '../../../core/oferta/model/Status';
import { OdbiorType } from '../../../core/oferta/model/OdbiorType';

export default (
    html: string,
    errors: any[],
    subTaskProps: IParseListProps<ISemekoListElement, ISemekoDetails>
): { items: ISemekoListElement[], tasks?: IAsyncTask[] } => {

    const root = parse(html);
    const rows = root.querySelectorAll('div.table-list .row');
    const tooltips = root.querySelector('#mystickytooltip');

    const items: ISemekoListElement[] = [];
    rows.forEach((row, idx) => {
        const h = new HtmlParserHelper<ISemekoListElement>(`${subTaskProps.dataProvider.inwestycjaId} X ${idx}`, errors);
        items.push(rowMapper(row, tooltips, h, subTaskProps.dataProvider))
    });

    const h = new HtmlParserHelper<ISemekoListElement>(`${subTaskProps.dataProvider.inwestycjaId} X buildPostTasks`, errors);
    const tasks = buildPostTasks(root, subTaskProps, h);

    return { items, tasks };
}

// ****************************
// mapper
// ****************************

function rowMapper(
    row: HTMLElement | undefined,
    tooltips: HTMLElement | undefined,
    h: HtmlParserHelper<ISemekoListElement>,
    dataProvider: IDataProvider<ISemekoListElement, ISemekoDetails>
): ISemekoListElement {

    const zasobyDoPobrania = getZasobyDoPobrania(row, tooltips, h);

    const result: ISemekoListElement = {
        id: 'tmp_id',
        ...h.asString('budynek', row?.querySelector('.c1')),
        ...h.asString('nrLokalu', row?.querySelector('.c2')),
        ...h.asInt('pietro', row?.querySelector('.c3')),
        ...h.asFloat('metraz', row?.querySelector('.c5')),
        ...h.asInt('liczbaPokoi', row?.querySelector('.c6')),
        ...h.asCustom('odbior', row?.querySelector('.c7'), { mapper: odbiorMapper }),
        status: Status.WOLNE,
        ...h.asMap("cechy", row?.querySelectorAll('.c9 span.more4'), cechaParser, { notEmpty: false }),
        ...h.asCustomWithDefault("detailsUrl", row?.querySelector('.c1'),
            { fromAttribute: 'onclick', mapper: detailsUrlParser, defaultValue: '', }
        ),
        zasobyDoPobrania,
    };

    result.id = `${dataProvider.inwestycjaId}-${result.budynek}-${result.nrLokalu}`;

    return result;
}

// ****************************
// mapper utils
// ****************************

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

function detailsUrlParser(raw: string) {
    const exprResult = /location\.href=\'(.+)'/.exec(raw || '');

    if (exprResult && exprResult[1]) {
        return `https://www.semeko.pl${exprResult[1]}`;
    }

    return null;
}

function getZasobyDoPobrania(row: HTMLElement | undefined, tooltips: HTMLElement | undefined, h: HtmlParserHelper<ISemekoListElement>) {
    const result: { id: string, url: string }[] = [];

    const miniaturkaUrl = getMiniaturkaUrl(row, tooltips, h);
    if (miniaturkaUrl) {
        result.push({ id: 'miniaturka', url: miniaturkaUrl })
    }

    return result;
}

function getMiniaturkaUrl(row: HTMLElement | undefined, tooltips: HTMLElement | undefined, h: HtmlParserHelper<ISemekoListElement>) {
    if (!!!tooltips) {
        h.addError('zasobyDoPobrania', 'tooltips === undefined');
        return null;
    }

    const dataTooltip = h.readTextOf(row?.querySelector('.c111 a'),
        { fieldName: 'zasobyDoPobrania', comment: 'data-tooltip' },
        { fromAttribute: 'data-tooltip', notEmpty: true, }
    );

    const srcPart = h.readTextOf(tooltips?.querySelector(`[id='${dataTooltip}'] img`),
        { fieldName: 'zasobyDoPobrania', comment: 'src' },
        { fromAttribute: 'src', notEmpty: true, }
    );

    return !!srcPart
        ? `https://www.semeko.pl${srcPart}`
        : null;
}

// ****************************
// post task builder
// ****************************

function buildPostTasks(
    root: HTMLElement | undefined,
    subTaskProps: IParseListProps<ISemekoListElement, ISemekoDetails>,
    h: HtmlParserHelper<ISemekoListElement>) {
    const nextPageUrl = getNextPageUrl(root, h);

    return nextPageUrl
        ? [new ProvideOfferTask1({ ...subTaskProps.dataProvider, getListUrl: () => nextPageUrl }, subTaskProps.priority)]
        : [];
}

// ****************************
// post task builder utils
// ****************************

function getNextPageUrl(root: HTMLElement | undefined, h: HtmlParserHelper<ISemekoListElement>) {
    const urlPart = h.readTextOf(root?.querySelector('div.next a'),
        { comment: 'getNextPageUrl' },
        {
            notEmpty: false,
            notNull: false,
            fromAttribute: 'onclick'
        });

    const exprResult = /='(.+)';/.exec(urlPart || '');

    if (exprResult && exprResult[1]) {
        return `https://www.semeko.pl${exprResult[1]}`;
    }

    return null;
}
