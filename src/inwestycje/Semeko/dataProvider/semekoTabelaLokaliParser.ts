import { HTMLElement, parse } from 'node-html-parser';
import { IAsyncTask } from "../../../core/asyncTask/IAsyncTask";
import { IDataProviderParserProps } from "../../../core/oferta/IOfertaProvider";
import { ICechy } from '../../../core/oferta/model/IOfertaModel';
import { OdbiorType } from '../../../core/oferta/model/OdbiorType';
import { Status } from '../../../core/oferta/model/Status';
import ProvideOfferTask1 from "../../../core/oferta/tasks/ProvideOfferTask1";
import { HtmlParser } from '../../helpers/HtmlParser';
import { ISemekoDataProvider, ISemekoParserProps } from './SemekoDataProviderBuilder';
import { ISemekoDetails, ISemekoListElement } from "./SemekoModel";
import ParserHelper from '../../../inwestycje/helpers/ParserHelper';

export default (
    html: string,
    errors: any[],
    props: ISemekoParserProps
): { items: ISemekoListElement[], tasks?: IAsyncTask[] } => {

    const root = parse(html);
    const rows = root.querySelectorAll('div.table-list .row');
    const tooltips = root.querySelector('#mystickytooltip');

    const items: ISemekoListElement[] = [];
    rows.forEach((row, idx) => {
        const h = new HtmlParser<ISemekoListElement>(`${props.dataProvider.inwestycjaId} X ${idx}`, errors);
        items.push(rowMapper(row, tooltips, h, props.dataProvider))
    });

    const h = new HtmlParser<ISemekoListElement>(`${props.dataProvider.inwestycjaId} X buildPostTasks`, errors);
    const tasks = buildPostTasks(root, props, h);

    return { items, tasks };
}

// ****************************
// mapper
// ****************************

function rowMapper(
    row: HTMLElement | undefined,
    tooltips: HTMLElement | undefined,
    h: HtmlParser<ISemekoListElement>,
    dataProvider: ISemekoDataProvider
): ISemekoListElement {

    const zasobyDoPobrania = getZasobyDoPobrania(row, tooltips, h);

    const result: ISemekoListElement = {
        id: 'tmp_id',
        ...h.asText('budynek', row?.querySelector('.c1')),
        ...h.asText('nrLokalu', row?.querySelector('.c2')),
        ...h.asInt('pietro', row?.querySelector('.c3')),
        ...h.asFloat('metraz', row?.querySelector('.c5')),
        ...h.asInt('lpPokoj', row?.querySelector('.c6'), ParserHelper.pokoj),
        ...h.asCustom('odbior', row?.querySelector('.c7'), odbiorMapper),
        status: Status.WOLNE,
        ...h.asMap("cechy", row?.querySelectorAll('.c9 span.more4'), cechaParser, { errorWhenEmpty: false, mustExist: false }),
        ...h.asString("offerDetailsUrl", row?.querySelector('.c1'), detailsUrlParser, { attributeName: 'onclick' }),
        zasobyDoPobrania,
    };

    result.id = `${dataProvider.inwestycjaId}-${result.budynek}-${result.nrLokalu}`;

    return result;
}

// ****************************
// mapper utils
// ****************************

function odbiorMapper(rawText: string | null | undefined): OdbiorType | null {
    if (rawText === null || rawText === undefined) {
        return null;
    }

    const exprResult = /(\d{4})-(\d{2})/.exec(rawText || '');

    if (!exprResult || !exprResult[1]) {
        return { raw: rawText };
    }

    const rok = Number.parseInt(exprResult[1]);
    const miesiac = Number.parseInt(exprResult[2]);

    if (isNaN(miesiac) || isNaN(rok)) {
        return { raw: rawText };
    }

    return { miesiac, rok };
}

function cechaParser(source: string | undefined | null): Partial<ICechy> | string | null {
    switch (source) {
        case 'o': return 'ogród';
        case 't/o': return 'taras/ogród';
        case 'b': return 'balkon';
        case 'a': return 'antresola';
        case 'l': return 'loggia';
    }
    return null
}

function detailsUrlParser(raw: string | null | undefined) {
    const exprResult = /location\.href=\'(.+)'/.exec(raw || '');

    if (exprResult && exprResult[1]) {
        return `https://www.semeko.pl${exprResult[1]}`;
    }

    return null;
}

function getZasobyDoPobrania(row: HTMLElement | undefined, tooltips: HTMLElement | undefined, h: HtmlParser<ISemekoListElement>) {
    const result: { id: string, url: string }[] = [];

    const miniaturkaUrl = getMiniaturkaUrl(row, tooltips, h);
    if (miniaturkaUrl) {
        result.push({ id: 'miniaturka', url: miniaturkaUrl })
    }

    return result;
}

function getMiniaturkaUrl(row: HTMLElement | undefined, tooltips: HTMLElement | undefined, h: HtmlParser<ISemekoListElement>) {
    if (!!!tooltips) {
        h.addError('zasobyDoPobrania', 'tooltips === undefined');
        return null;
    }

    const dataTooltip = h.readAttributeOf(
        row?.querySelector('.c111 a'),
        'data-tooltip',
        {
            fieldInfo: { fieldName: 'zasobyDoPobrania', comment: 'data-tooltip' },
        }
    );

    const srcPart = h.readAttributeOf(
        tooltips?.querySelector(`[id='${dataTooltip}'] img`),
        'src',
        {
            fieldInfo: { fieldName: 'zasobyDoPobrania', comment: 'src' },
        }
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
    subTaskProps: IDataProviderParserProps<ISemekoListElement, ISemekoDetails>,
    h: HtmlParser<ISemekoListElement>) {
    const nextPageUrl = getNextPageUrl(root, h);

    return nextPageUrl
        ? [new ProvideOfferTask1({ ...subTaskProps.dataProvider, getListUrl: () => nextPageUrl }, subTaskProps.priority)]
        : [];
}

// ****************************
// post task builder utils
// ****************************

function getNextPageUrl(root: HTMLElement | undefined, h: HtmlParser<ISemekoListElement>) {
    const urlPart = h.readAttributeOf(
        root?.querySelector('div.next a'),
        'onclick',
        {
            fieldInfo: { comment: 'getNextPageUrl' },
            errorWhenEmpty: false,
            mustExist: false
        });

    const exprResult = /='(.+)';/.exec(urlPart || '');

    if (exprResult && exprResult[1]) {
        return `https://www.semeko.pl${exprResult[1]}`;
    }

    return null;
}
