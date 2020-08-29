import cheerio from 'cheerio';
import { HTMLElement } from 'node-html-parser';
import { ICechy, IRawData, MapWithRawType } from '../../../core/oferta/model/IOfertaModel';
import { Status } from '../../../core/oferta/model/Status';
import { raw2StronaSwiata, StronaSwiata, StronaSwiataHelper } from '../../../core/oferta/model/StronySwiata';
import { HtmlParser } from '../../../inwestycje/helpers/HtmlParser';
import ParserHelper from '../../../inwestycje/helpers/ParserHelper';
import { IInproDataProvider, IInproParserProps } from '../InproDataProviderBuilder';
import { IInproListElement, IInproOfferDetails } from './InproModel';
import TypeUtils from '@src/utils/TypeUtils';

export default {
    listMapper,
    detailMapper
}

function listMapper(
    html: string,
    errors: any[],
    props: IInproParserProps
) {
    const root = HtmlParser.parseHtml(html);
    const rows = root.querySelectorAll('form.offer-search table.price-list tbody tr');

    const items = rows.map((row, idx) => {
        const h = new HtmlParser(`${props.dataProvider.inwestycjaId}x${idx}`, errors);
        return rowMapper(row, h, props.dataProvider)
    })

    return { items };
}

async function detailMapper(
    html: string | string[],
    errors: any[],
    offerId: string,
    props: IInproParserProps
): Promise<IInproOfferDetails> {

    if (html instanceof Array) {
        throw new Error('maper przenaczony dla pojedynczego rekordu, otrzymano tablicę');
    }

    const rows = cheerio.load(html)('div.offer-card-header p');

    const zakonczenieRaw = rows
        .filter((_, item) => cheerio(item).text().indexOf('zakończenie') >= 0)
        .text();

    const sourceOfertaPdfUrl = cheerio.load(html)('a.pdf')?.attr('href');

    const result: IInproOfferDetails = {
        odbior: odbiorParser(zakonczenieRaw),
        sourceOfertaPdfUrl,
    };

    return result;
}

// ////////////////////////////////////
// private
// ////////////////////////////////////

function rowMapper(
    row: HTMLElement | undefined,
    h: HtmlParser<IInproListElement>,
    dataProvider: IInproDataProvider
): IInproListElement {

    const cols = row?.querySelectorAll('td');

    const result: IInproListElement = {
        id: 'tmp_id',
        budynek: 'tmp_nr',
        typ: dataProvider.data.typ,
        ...h.asInt('lpPokoj', cols && cols[0]),
        ...h.asInt('pietro', cols && cols[1], ParserHelper.pietro),
        ...h.asFloat('metraz', cols && cols[2], ParserHelper.float()),
        ...h.asText('nrLokalu', cols && cols[3]),
        ...h.asFloatOptional('cena', cenaEl(cols && cols[5]), ParserHelper.cena(/(-?[\d\s,.]+)/)),
        status: Status.WOLNE,
        ...h.asRawOptional('offerDetailsUrl', cols && cols[3].querySelector('a'), { attributeName: 'href' }),
        cechy: cechyParser(cols && cols[6], h),
        stronySwiata: stronySwiataParser(cols && cols[6], h),
    };

    result.id = `${dataProvider.inwestycjaId}-${result.nrLokalu}`;
    result.budynek = result.nrLokalu[0];

    return result;
}

function cenaEl(el: HTMLElement | undefined): HTMLElement | undefined {
    return (el && el.querySelector('.new-price span')) || el;
}

function cechyParser(el: HTMLElement | undefined, h: HtmlParser<IInproListElement>): MapWithRawType<ICechy> {
    const result: MapWithRawType<ICechy> = { map: {}, raw: [] };

    el?.querySelectorAll('span').forEach(e => {
        const cecha = h.readAttributeOf(e, 'data-tip', { fieldInfo: 'cechy' });
        if (cecha && cecha.indexOf('Ekspozycja okien') === -1) {
            result.raw?.push(cecha);
        }
    })

    if (result.raw?.length === 0) {
        delete result.raw;
    }
    return result;
}

function stronySwiataParser(el: HTMLElement | undefined, h: HtmlParser<IInproListElement>): Array<StronaSwiata | IRawData> {
    const result: Array<StronaSwiata | IRawData> = [];

    el?.querySelectorAll('span').forEach(e => {
        const cecha = h.readAttributeOf(e, 'data-tip', { fieldInfo: 'cechy' });
        if (cecha && cecha.indexOf('Ekspozycja okien') !== -1) {
            cecha
                .replace('Ekspozycja okien:', '')
                .split(',')
                .map(StronaSwiataHelper.raw2StronaSwiata)
                .filter(TypeUtils.notEmpty)
                .forEach(v => result.push(v));
        }
    });

    return result;
}

function odbiorParser(raw: string): { rok: number, miesiac: number } | IRawData {
    const exprResult = /\d{2}\.(\d{2})\.(\d{4})/.exec(raw);

    if (!exprResult || !exprResult[1]) {
        return { raw };
    }

    const miesiac = Number.parseInt(exprResult[1]);
    const rok = Number.parseInt(exprResult[2]);

    if (isNaN(miesiac) || isNaN(rok)) {
        return { raw };
    }

    return { miesiac, rok };
}
