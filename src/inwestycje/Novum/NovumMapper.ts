import cheerio from 'cheerio';
import { IRawData } from '../../dataProvider/IOfertaRecord';
import CheerioHelper from '../../utils/CheerioHelper';
import { NovumDataProvider } from './NovumDataProvider';
import { INovumDetails, INovumListElement } from './NovumSchema';

export default {
    listMapper,
    detailMapper
}

function listMapper(html: string): INovumListElement[] {
    const rows = cheerio
        .load(html)('.list-item.box');

    const result: INovumListElement[] = [];
    rows.each((idx, row) => {
        result.push(rowMapper(idx, row));
    });

    return result;
}

async function detailMapper(html: string): Promise<INovumDetails> {
    const rows = cheerio.load(html)('.single__flat__table.row').children();

    const udogodnienia = rows
        .filter((_, item) => cheerio(item).text() === 'Udogodnienia')?.next()?.text();

    const stronyŚwiata = rows
        .filter((_, item) => cheerio(item).text() === 'Ekspozycja okien')?.next()?.text();

    const pdfUrl = cheerio.load(html)('[title="Pobierz PDF"]')?.attr('href');

    const result: INovumDetails = {
        udogodnienia,
        stronyŚwiata,
        pdfUrl
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
        detailsUrl: row.children[9]?.lastChild?.attribs['href']
    };

    result.id = `${NovumDataProvider.inwestycjaId}-${result.budynek}-${result.nrLokalu}`;

    return result;
}

function cenaParser(raw: string): number | IRawData {
    const cenaStr = raw?.replace(/zł|\s/, '');
    const result = Number.parseInt(cenaStr);

    return isNaN(result)
        ? { raw }
        : result;
}