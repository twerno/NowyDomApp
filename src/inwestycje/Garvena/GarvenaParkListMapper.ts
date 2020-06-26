import { HTMLElement, parse } from 'node-html-parser';
import parseUtils from '../../core/utils/parseUtils';
import { IDataProvider, IParseListProps } from "../../core/oferta/IOfertaProvider";
import { KartaOfertyPdf, OdbiorType, Status } from "../../core/oferta/model/IOfertaModel";
import { HtmlParserHelper } from '../../core/utils/HtmlParserHelper';
import { IGarvenaParkDetails, IGarvenaParkListElement } from './GarvenaParkModel';

export default (
    html: string,
    errors: any[],
    props: IParseListProps<IGarvenaParkListElement, IGarvenaParkDetails>
): { items: IGarvenaParkListElement[] } => {

    const root = parse(html.substring(html.indexOf('<table'), html.indexOf('</table>')));
    const rows = root.querySelectorAll('tr');

    const items: IGarvenaParkListElement[] = rows
        .filter((_, idx) => idx !== 0)
        .map((row, idx) => {
            const parserId = `${props.dataProvider.inwestycjaId} X ${idx}`;
            const h = new HtmlParserHelper<IGarvenaParkListElement>(parserId, errors);

            return rowMapper(row, h, props.dataProvider);
        });

    return { items };
}

// ****************************
// mapper
// ****************************

function rowMapper(
    row: HTMLElement | undefined,
    h: HtmlParserHelper<IGarvenaParkListElement>,
    dataProvider: IDataProvider<IGarvenaParkListElement, IGarvenaParkDetails>
): IGarvenaParkListElement {

    const zasobyDoPobrania = getZasobyDoPobrania(row, h);

    const result: IGarvenaParkListElement = {
        id: 'tmp_id',
        ...h.asString('nrLokalu', row?.querySelectorAll('td')[0]),
        ...h.asFloat('liczbaKondygnacji', row?.querySelectorAll('td')[1]),
        ...h.asInt('liczbaPokoi', row?.querySelectorAll('td')[2]),
        ...h.asFloat('metraz', row?.querySelectorAll('td')[3]),
        ...h.asFloat('powiezchniaOgrodu', row?.querySelectorAll('td')[4], /ok\.(\d]+) m²/),
        ...h.asCustom('odbior', row?.querySelectorAll('td')[5], { mapper: odbiorMapper }),
        ...h.asCustom('status', row?.querySelectorAll('td')[6], { mapper: statusMapper }),
        zasobyDoPobrania,
    };

    result.id = `${dataProvider.inwestycjaId}-${result.nrLokalu}`;

    return result;
}

// ****************************
// mapper utils
// ****************************

function odbiorMapper(raw: string | null): OdbiorType | null {
    const exprResult = /(\w)-(\d{4})r./.exec(raw || '');

    if (!exprResult || !exprResult[1]) {
        return { raw };
    }

    const miesiac = parseUtils.parseMiesiac(exprResult[1]);
    const rok = Number.parseInt(exprResult[2]);

    if (miesiac === null || isNaN(rok)) {
        return { raw };
    }

    return { miesiac, rok };
}

function statusMapper(raw: string): Status | null {
    switch (raw) {
        case 'Wolne': return Status.WOLNE;
        case 'Sprzedane': return Status.SPRZEDANE;
        case 'Rezerwacja': return Status.ZAREZERWOWANE;
        default: return null;
    }
}

function getZasobyDoPobrania(row: HTMLElement | undefined, h: HtmlParserHelper<IGarvenaParkListElement>) {
    const result: { id: string, url: string }[] = [];

    const pdfUrl = h.readTextOf(
        row?.querySelectorAll('td')[8]?.querySelector('a'),
        { fieldName: 'zasobyDoPobrania', comment: 'pdf' },
        { fromAttribute: 'href', mapper: rawText => rawText, notEmpty: true })

    if (pdfUrl) {
        result.push({ id: KartaOfertyPdf, url: pdfUrl })
    }

    return result;
}