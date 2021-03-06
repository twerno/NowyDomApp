import { HTMLElement, parse } from 'node-html-parser';
import { ZASOBY } from "../../core/oferta/model/IOfertaModel";
import { OdbiorType } from '../../core/oferta/model/OdbiorType';
import DataParserHelper from '../utils/ParserHelper';
import { HtmlParser } from '../utils/HtmlParser';
import { IGarvenaParkParserProps } from './GarvenaPark';
import { IGarvenaParkListElement } from './GarvenaParkModel';
import { IStringMap } from '@src/core/utils/IMap';
import { IRawData } from '@src/core/oferta/model/IRawData';

export default (
    html: string,
    errors: any[],
    props: IGarvenaParkParserProps
): { items: IGarvenaParkListElement[] } => {

    const root = parse(html.substring(html.indexOf('<table'), html.indexOf('</table>')));
    const rows = root.querySelectorAll('tr');

    const rowsMap: IStringMap<HTMLElement> = {}
    rows.forEach(row => rowsMap[row.structuredText] = row);

    const items: IGarvenaParkListElement[] = Object.values(rowsMap)
        .filter((row, idx) => idx !== 0)
        .map((row, idx) => {
            const parserId = `${props.dataProvider.inwestycjaId} X ${idx}`;
            const h = new HtmlParser<IGarvenaParkListElement>(parserId, errors);

            return rowMapper(row, h, props);
        });

    return { items };
}

// ****************************
// mapper
// ****************************

function rowMapper(
    row: HTMLElement | undefined,
    h: HtmlParser<IGarvenaParkListElement>,
    props: IGarvenaParkParserProps
): IGarvenaParkListElement {

    const zasobyDoPobrania = getZasobyDoPobrania(row, h);

    const rows = row?.querySelectorAll('td') || [];

    const result: IGarvenaParkListElement = {
        id: 'tmp_id',
        ...h.asText('nrLokalu', rows[0]),
        ...h.asFloat('liczbaKondygnacji', rows[1]),
        ...h.asInt('lpPokoj', rows[2]),
        ...h.asFloat('metraz', rows[3]),
        ...h.asFloatOptional('powiezchniaOgrodu', rows[4], powiezchniaOgrodu),
        ...h.asCustom('odbior', rows[5], odbiorMapper),
        ...h.asCustom('status', rows[6], DataParserHelper.status),
        zasobyDoPobrania,
    };

    result.id = `${props.dataProvider.inwestycjaId}-${result.nrLokalu}`;

    return result;
}

// ****************************
// mapper utils
// ****************************

function odbiorMapper(raw: string | null | undefined): OdbiorType | null {
    if (raw === null || raw === undefined) {
        return null;
    }

    const exprResult = /(\w)-(\d{4})r./.exec(raw || '');

    if (!exprResult || !exprResult[1]) {
        return { raw };
    }

    const miesiac = DataParserHelper.miesiac(exprResult[1]);
    const rok = Number.parseInt(exprResult[2]);

    if (miesiac === null || isNaN(rok)) {
        return { raw };
    }

    return { miesiac, rok };
}

function getZasobyDoPobrania(row: HTMLElement | undefined, h: HtmlParser<IGarvenaParkListElement>) {
    const result: { id: string, url: string }[] = [];

    const pdfUrl = h.readAttributeOf(
        row?.querySelectorAll('td')[8]?.querySelector('a'),
        'href',
        {
            fieldInfo: { fieldName: 'zasobyDoPobrania', comment: 'pdf' },
            mustExist: false,
            errorWhenEmpty: false
        }
    );

    if (pdfUrl) {
        result.push({ id: ZASOBY.PDF, url: pdfUrl })
    }

    return result;
}

function powiezchniaOgrodu(rawText: string | null | undefined): number | null | IRawData {
    if (rawText === '-') {
        return { raw: null };
    }
    return DataParserHelper.float(/ok\.(\d+)\s+m²/)(rawText);
}