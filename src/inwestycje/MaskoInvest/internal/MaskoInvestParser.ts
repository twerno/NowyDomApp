import CommConv from '@src/inwestycje/utils/CommConv';
import { HTMLElement } from 'node-html-parser';
import { MapWithRawType } from '../../../core/oferta/model/IOfertaModel';
import { HtmlParser } from '../../helpers/HtmlParser';
import ParserHelper from '../../helpers/ParserHelper';
import { IMaskoInvestDataProvider, IMaskoInvestParserProps } from '../MaskoInvestDataProviderBuilder';
import { IMaskoInvestListElement } from './MaskoInvestModel';
import { ofertaIdBuilderExcept } from '@src/core/oferta/IOfertaProvider';
import { IRawData } from '@src/core/oferta/model/IRawData';
import { ICechy } from '@src/core/oferta/model/ICechy';

export default {
    listMapper
}

function listMapper(
    html: string,
    errors: any[],
    props: IMaskoInvestParserProps
) {
    const root = HtmlParser.parseHtml(html);
    const rows = root.querySelectorAll('table.appartments-table tr');

    const items = rows
        .filter((_, idx) => idx > 1) // 2 piersze wiersze to nagłówki
        .map((row, idx) => {
            const h = new HtmlParser(`${props.dataProvider.inwestycjaId}x${idx}`, errors);
            return rowMapper(row, h, props.dataProvider)
        })

    return { items };
}

// ////////////////////////////////////
// private
// ////////////////////////////////////

function rowMapper(
    row: HTMLElement | undefined,
    h: HtmlParser<IMaskoInvestListElement>,
    dataProvider: IMaskoInvestDataProvider
): IMaskoInvestListElement {

    const cols = row?.querySelectorAll('td');

    const result: IMaskoInvestListElement = {
        id: 'tmp_id',
        ...h.asFloat('metraz', cols && cols[1], ParserHelper.float()),
        ...h.asInt('pietro', cols && cols[2], ParserHelper.pietro),
        ...h.asInt('lpPokoj', cols && cols[3]),
        cechy: cechyParser(cols && cols[4], h),
        ...h.asCustom('status', cols && cols[5], ParserHelper.status),
        ...h.asCustom('odbior', cols && cols[6], odbiorParser),
        ...h.asText('sourceOfertaPdfUrl', cols && cols[8]?.querySelector('a'), { attributeName: 'href' }),
        typ: dataProvider.data.typ,
    };

    result.id = ofertaIdBuilderExcept([dataProvider.inwestycjaId, h.readTextOf(cols && cols[0], { fieldInfo: 'id' })]);

    return result;
}

function cechyParser(el: HTMLElement | undefined, h: HtmlParser<IMaskoInvestListElement>): MapWithRawType<ICechy> {
    const result: MapWithRawType<ICechy> = { map: {}, raw: [] };

    const cechy = h.readTextOf(el, { fieldInfo: 'cechy' })?.toLocaleLowerCase();

    if (cechy && cechy.indexOf('balkon') >= 0) {
        result.map.balkon = true;
        cechy.replace('balkon', '');
    };

    if (cechy && cechy.indexOf('ogród') >= 0) {
        result.map.ogród = true;
        cechy.replace('ogród', '');
    }

    if (cechy && cechy.trim().length > 0) {
        result.raw?.push(cechy.trim());
    }

    if (result.raw?.length === 0) {
        delete result.raw;
    }
    return result;
}

function odbiorParser(rawText: string | null | undefined): { rok: number, miesiac: number } | IRawData | null {
    if (rawText === null || rawText === undefined) {
        return null;
    }

    const exprResult = /(\w+) (\d{4})/.exec(rawText);

    if (!exprResult || !exprResult[1] || !exprResult[2]) {
        return { raw: rawText };
    }

    const miesiac = CommConv.rzymskie2arabskie(exprResult[1]);
    const rok = Number.parseInt(exprResult[2]);

    if (isNaN(miesiac) || isNaN(rok)) {
        return { raw: rawText };
    }

    return { miesiac, rok };
}
