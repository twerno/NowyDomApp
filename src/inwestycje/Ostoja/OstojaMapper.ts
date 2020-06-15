import cheerio from 'cheerio';
import { IRawData, Status, ICechy, StronySwiata, stronySwiataMaper } from '../../dataProvider/IOfertaRecord';
import CheerioHelper from '../../utils/CheerioHelper';
import { IOstojaListElement, IOstojaOfferDetails } from './OstojaModel';
import { OstojaDataProvider } from './OstojaDataProvider';
import { ISubTaskProps } from '../../dataProvider/IOfertaProvider';

export default {
    listMapper,
    detailMapper
}

function listMapper(
    html: string,
    errors: any[],
    subTaskProps: ISubTaskProps<IOstojaListElement, IOstojaOfferDetails>
) {
    const rows = cheerio
        .load(html)('form.offer-search .price-list > tbody > tr');

    const items: IOstojaListElement[] = [];
    rows.each((idx, row) => {
        items.push(rowMapper(idx, row));
    });

    return { items };
}

async function detailMapper(html: string | string[]): Promise<IOstojaOfferDetails> {

    if (html instanceof Array) {
        throw new Error('maper przenaczony dla pojedynczego rekordu, otrzymano tablicę');
    }

    const rows = cheerio.load(html)('.offer-card-header .row p').children();

    const zakonczenieRaw = rows
        .filter((_, item) => cheerio(item).text().indexOf('zakończenie') >= 0)
        .text();


    const sourceOfertaPdfUrl = cheerio.load(html)('a.pdf')?.attr('href');

    const result: IOstojaOfferDetails = {
        odbior: odbiorParser(zakonczenieRaw),
        sourceOfertaPdfUrl,
    };

    return result;
}

// ////////////////////////////////////
// private
// ////////////////////////////////////

function rowMapper(rowIdx: number, row: CheerioElement): IOstojaListElement {

    const cols = cheerio.load(row)('td');

    const result: IOstojaListElement = {
        id: 'tmp_id',
        budynek: 'tmp_nr',
        lpPokoj: CheerioHelper.loadInt(cols[0]),
        pietro: pietroParser(CheerioHelper.loadString(cols[1])),
        metraz: CheerioHelper.loadFloat(cols[2]),
        nrLokalu: CheerioHelper.loadString(cols[3]),
        cena: cenaParser(cols[5]),
        status: Status.WOLNE,
        offerDetailsUrl: detaleUrlParser(cols[3]),
        cechy: cechyParser(cols[6]),
        stronySwiata: stronySwiataParser(cols[6]),
    };

    result.id = `${OstojaDataProvider.inwestycjaId}-${result.nrLokalu}`;
    result.budynek = result.nrLokalu[0];

    return result;
}

function cenaParser(element: CheerioElement): number | IRawData {
    let raw: string = '';
    if (element?.firstChild?.tagName === 'div') {
        raw = cheerio.load(element)('.new-price span').text();
    }
    else {
        raw = cheerio(element).text()
    }
    const cenaStr = raw?.replace(/zł|\s/g, '')?.replace(/,/g, '.');
    const result = Number.parseFloat(cenaStr);

    return isNaN(result)
        ? { raw }
        : result;
}

function detaleUrlParser(element: CheerioElement): string | undefined {
    return cheerio.load(element)('a').attr('href')?.trim();
}

function cechyParser(element: CheerioElement): { data: Partial<ICechy>, raw?: string[] } {
    const result: { data: Partial<ICechy>, raw?: string[] } = { data: {}, raw: [] };

    cheerio(element).find('span[data-tip]')
        .each((_, el) => {
            const dataTip = el.attribs['data-tip'];
            if (dataTip.indexOf('Ekspozycja okien') >= 0) {
                return;
            }
            result.raw?.push(dataTip);
        });

    return result;
}

function stronySwiataParser(element: CheerioElement): Array<StronySwiata | IRawData> {
    const result: Array<StronySwiata | IRawData> = [];

    cheerio(element).find('span[data-tip]')
        .each((_, el) => {
            const dataTip = el.attribs['data-tip'];
            if (dataTip.indexOf('Ekspozycja okien') === -1) {
                return;
            }
            dataTip
                .replace('Ekspozycja okien:', '')
                .split(',')
                .forEach(text => result.push(stronySwiataMaper(text)))
        });

    return result;
}

function odbiorParser(raw: string): { rok: number, miesiac: number } | IRawData {
    const exprResult = /(\d{2}\.(\d{2})\.(\d{4}))/.exec(raw);

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

function pietroParser(raw: string): number | IRawData {
    if (raw === 'parter') {
        return 0;
    }

    const result = Number.parseInt(raw);
    return isNaN(result)
        ? { raw }
        : result;
}