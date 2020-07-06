import { HTMLElement, parse } from 'node-html-parser';
import { ZASOBY } from "../../core/oferta/model/IOfertaModel";
import { OdbiorType } from '../../core/oferta/model/OdbiorType';
import DataParserHelper from '../../inwestycje/helpers/DataParserHelper';
import { HtmlParserHelper } from '../../inwestycje/helpers/HtmlParserHelper';
import { IGarvenaParkParserProps } from './GarvenaPark';
import { IGarvenaParkListElement } from './GarvenaParkModel';

export default (
    html: string,
    errors: any[],
    props: IGarvenaParkParserProps
): { items: IGarvenaParkListElement[] } => {

    const root = parse(html.substring(html.indexOf('<table'), html.indexOf('</table>')));
    const rows = root.querySelectorAll('tr');

    const items: IGarvenaParkListElement[] = rows
        .filter((_, idx) => idx !== 0)
        .map((row, idx) => {
            const parserId = `${props.dataProvider.inwestycjaId} X ${idx}`;
            const h = new HtmlParserHelper<IGarvenaParkListElement>(parserId, errors);

            return rowMapper(row, h, props);
        });

    return { items };
}

// ****************************
// mapper
// ****************************

function rowMapper(
    row: HTMLElement | undefined,
    h: HtmlParserHelper<IGarvenaParkListElement>,
    props: IGarvenaParkParserProps
): IGarvenaParkListElement {

    const zasobyDoPobrania = getZasobyDoPobrania(row, h);

    const rows = row?.querySelectorAll('td') || [];

    const result: IGarvenaParkListElement = {
        id: 'tmp_id',
        ...h.asRaw('nrLokalu', rows[0]),
        ...h.asFloat('liczbaKondygnacji', rows[1]),
        ...h.asInt('liczbaPokoi', rows[2]),
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

function getZasobyDoPobrania(row: HTMLElement | undefined, h: HtmlParserHelper<IGarvenaParkListElement>) {
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

function powiezchniaOgrodu(rawText: string | null | undefined): number | null | undefined {
    if (rawText === '-') {
        return undefined;
    }
    return DataParserHelper.float(/ok\.(\d+)\s+m²/)(rawText);
}