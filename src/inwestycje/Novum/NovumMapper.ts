import cheerio from 'cheerio';
import { IRawData } from '../../core/oferta/model/IOfertaModel';
import CheerioHelper from '../helpers/CheerioHelper';
import { Novum, INovumData, INovumParserProps } from './Novum';
import { INovumDetails, INovumListElement } from './NovumSchema';

export default {
    listMapper,
    detailMapper
}

function listMapper(
    html: string,
    errors: any[],
    props: INovumParserProps
) {
    const rows = cheerio
        .load(html)('.list-item.box');

    const items: INovumListElement[] = [];
    rows.each((idx, row) => {
        items.push(rowMapper(idx, row));
    });

    return { items };
}

async function detailMapper(html: string | string[]): Promise<INovumDetails> {
    if (html instanceof Array) {
        throw new Error('maper przenaczony dla pojedynczego rekordu, otrzymano tablicę');
    }

    const rows = cheerio.load(html)('.single__flat__table.row').children();

    const udogodnienia = rows
        .filter((_, item) => cheerio(item).text() === 'Udogodnienia')?.next()?.text();

    const stronyŚwiata = rows
        .filter((_, item) => cheerio(item).text() === 'Ekspozycja okien')?.next()?.text();

    const pdfUrl = cheerio.load(html)('[title="Pobierz PDF"]')?.attr('href');

    const result: INovumDetails = {
        udogodnienia,
        stronyŚwiata,
        sourceOfertaPdfUrl: pdfUrl
    };

    return result;
}

// ////////////////////////////////////
// private
// ////////////////////////////////////

function rowMapper(rowIdx: number, row: CheerioElement): INovumListElement {

    const result: INovumListElement = {
        id: 'tmp_id',
        budynek: CheerioHelper.loadString(row.children[0]),
        nrLokalu: CheerioHelper.loadString(row.children[1]),
        piętro: CheerioHelper.loadInt(row.children[2]),
        metraż: CheerioHelper.loadFloat(row.children[3]),
        liczbaPokoi: CheerioHelper.loadInt(row.children[4]),
        odbiór: CheerioHelper.loadString(row.children[5]),
        status: CheerioHelper.loadString(row.children[6]),
        cena: cenaParser(CheerioHelper.loadString(row.children[7])),
        offerDetailsUrl: row.children[9]?.lastChild?.attribs['href']
    };

    result.id = `${Novum.inwestycjaId}-${result.budynek}-${result.nrLokalu}`;

    return result;
}

function cenaParser(raw: string): number | IRawData {
    const cenaStr = raw?.replace(/zł|\s/, '');
    const result = Number.parseInt(cenaStr);

    return isNaN(result)
        ? { raw }
        : result;
}