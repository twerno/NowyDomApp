import { HTMLElement } from 'node-html-parser';
import { IAsyncTask } from "../../../core/asyncTask/IAsyncTask";
import { ofertaIdBuilderExcept } from '../../../core/oferta/IOfertaProvider';
import { HtmlParser } from '../../helpers/HtmlParser';
import DataParserHelper from '../../helpers/ParserHelper';
import { IMatBudDataProvider, IMatBudParserProps } from './MatBudDataBuilder';
import { IMatBudListElement } from './MatBudModel';
import { ZASOBY, valueOfRaw } from '@src/core/oferta/model/IOfertaModel';
import TypeUtils from '@src/utils/TypeUtils';
import { Status } from '@src/core/oferta/model/Status';

export default (
    html: string,
    errors: any[],
    props: IMatBudParserProps
): { items: IMatBudListElement[], tasks?: IAsyncTask[] } => {

    const root = HtmlParser.parseHtml(html);
    const rows = root.querySelector('table.mieszkania-lista')
        ?.querySelector('tbody')
        ?.querySelectorAll('tr');

    const items: IMatBudListElement[] = rows
        ?.map(
            (row, idx) => {
                const h = new HtmlParser<IMatBudListElement>(`${props.dataProvider.inwestycjaId} X ${idx}`, errors);
                return rowMapper(row, h, props.dataProvider);
            }
        )
        .filter(TypeUtils.notEmpty);

    return { items };
}

// ****************************
// mapper
// ****************************

function rowMapper(
    row: HTMLElement | undefined,
    h: HtmlParser<IMatBudListElement>,
    dataProvider: IMatBudDataProvider
): IMatBudListElement | undefined {

    const cols = row?.querySelectorAll('td') || [];
    const pietro = h.readAndMapValueOf(cols[1], 'text', DataParserHelper.pietro, { 'fieldInfo': 'pietro', errorWhenEmpty: false });
    const metrazText = h.readTextOf(cols[2], { fieldInfo: 'metraz', errorWhenEmpty: false });

    const isRezerwacja = (valueOfRaw(h.readTextOf(cols[4], { fieldInfo: 'status', errorWhenEmpty: false })) || '') !== '';

    if (typeof pietro === 'number' && !isRezerwacja && metrazText?.toLocaleLowerCase().indexOf('garaż') === -1) {

        const result: IMatBudListElement = {
            id: 'tmp_id',
            typ: dataProvider.data.typ,
            ...h.asStringOptional('budynek', cols[0]),
            pietro,
            ...h.asFloat('metraz', cols[2], DataParserHelper.float()),
            status: Status.WOLNE,
            ...h.asString('nrLokalu', cols[6]?.querySelector('a.raleway') || cols[7]?.querySelector('a.raleway'), DataParserHelper.regExp(/\/(.+?).pdf$/), { attributeName: 'href' }),
            zasobyDoPobrania: zasobyDoPobrania(cols, h),
        };

        result.id = ofertaIdBuilderExcept([dataProvider.inwestycjaId, result.budynek, result.nrLokalu]);

        return result;
    }
    return undefined;
}

// ****************************
// mapper utils
// ****************************

function zasobyDoPobrania(cols: HTMLElement[], h: HtmlParser<IMatBudListElement>): { id: string, url: string }[] {
    const pdfLink = h.readAttributeOf(cols[6]?.querySelector('a.raleway') || cols[7]?.querySelector('a.raleway'),
        'href',
        { fieldInfo: { fieldName: 'zasobyDoPobrania', comment: 'pdfLink' } }
    );
    const result: { id: string, url: string }[] = [];

    if (pdfLink) {
        result.push({ id: ZASOBY.PDF, url: `http://matbudrumia.pl/${pdfLink}` });
    }

    return result;
}
