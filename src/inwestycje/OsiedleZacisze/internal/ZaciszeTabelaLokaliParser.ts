import { HTMLElement } from 'node-html-parser';
import { IAsyncTask } from "../../../core/asyncTask/IAsyncTask";
import { ofertaIdBuilderExcept } from '../../../core/oferta/IOfertaProvider';
import { HtmlParser } from '../../helpers/HtmlParser';
import DataParserHelper from '../../helpers/ParserHelper';
import { IZaciszeDataProvider, IZaciszeParserProps } from './ZaciszeDataBuilder';
import { IZaciszeListElement } from './ZaciszeModel';
import { MapWithRawType } from '@src/core/oferta/model/IOfertaModel';
import { ICechy } from '@src/core/oferta/model/ICechy';

export default (
    html: string,
    errors: any[],
    props: IZaciszeParserProps
): { items: IZaciszeListElement[], tasks?: IAsyncTask[] } => {

    const root = HtmlParser.parseHtml(html);
    const rows = root.querySelector('#apartments')?.querySelector('tbody')?.querySelectorAll('tr');

    const items: IZaciszeListElement[] = rows?.map(
        (row, idx) => {
            const h = new HtmlParser<IZaciszeListElement>(`${props.dataProvider.inwestycjaId} X ${idx}`, errors);
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
    h: HtmlParser<IZaciszeListElement>,
    dataProvider: IZaciszeDataProvider
): IZaciszeListElement {

    const cols: HTMLElement[] = row?.querySelectorAll('td') || [];

    const result: IZaciszeListElement = {
        id: 'tmp_id',
        typ: dataProvider.data.typ,
        ...h.asString('budynek', cols[1]),
        ...h.asInt('pietro', cols[2], DataParserHelper.pietro),
        ...h.asString('nrLokalu', cols[3]),
        ...h.asInt('lpPokoj', cols[4]),
        ...h.asFloat('metraz', cols[5], DataParserHelper.float()),
        ...h.asFloat('cena', cols[9], DataParserHelper.cena()),
        ...h.asCustom('status', cols[10], DataParserHelper.status),
        ...cechy(cols, h),
        ...offerDetailsUrl(cols[12], h),
    };

    result.id = ofertaIdBuilderExcept([dataProvider.inwestycjaId, result.budynek, result.nrLokalu]);

    return result;
}

// ****************************
// mapper utils
// ****************************

function cechy(cols: HTMLElement[], h: HtmlParser<IZaciszeListElement>) {
    const cechy: MapWithRawType<ICechy> = { map: {} };

    const balkon = h.readAndMapValueOf(cols[6], 'text', DataParserHelper.float(), { fieldInfo: { fieldName: 'cechy', comment: 'balkon' } });
    cechy.map.balkon = (typeof balkon === 'number' && balkon > 0) || undefined;

    const taras = h.readAndMapValueOf(cols[7], 'text', DataParserHelper.float(), { fieldInfo: { fieldName: 'cechy', comment: 'taras' } });
    cechy.map.taras = (typeof taras === 'number' && taras > 0) || undefined;

    const garaz = h.readTextOf(cols[11], { fieldInfo: { fieldName: 'cechy', comment: 'garaz' } });
    cechy.map["garaż indywidualny"] = garaz === 'garażowe' ? 0 : undefined;

    return { cechy };
}

function offerDetailsUrl(el: HTMLElement | undefined, h: HtmlParser<IZaciszeListElement>) {
    const input = el?.querySelectorAll('input').find(input => input.getAttribute('type') === 'hidden')
    const id = h.readAttributeOf(input, 'value', { fieldInfo: 'offerDetailsUrl' });

    return id
        ? { offerDetailsUrl: `https://osiedle-zacisze.com.pl/mieszkanie.php?id=${id}` }
        : { offerDetailsUrl: undefined };
}
