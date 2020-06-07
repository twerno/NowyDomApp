import cheerio from 'cheerio';
import { INovumListElement, INovumDetails } from './NovumSchema';

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

async function detailMapper(html: string, listItem: INovumListElement): Promise<INovumDetails> {
    const rows = cheerio.load(html)('.single__flat__table.row').children();

    const udogodnienia = rows
        .filter((_, item) => item.lastChild?.lastChild?.nodeValue === 'Udogodnienia')?.next()?.text();
    const stronyŚwiata = rows
        .filter((_, item) => item.lastChild?.lastChild?.nodeValue === 'Ekspozycja okien')?.next()?.text();
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
        inwestycjaId: 'tmp_inwestycjaId',
        budynek: row.children[0]?.lastChild?.nodeValue,
        nrLokalu: row.children[1]?.lastChild?.nodeValue,
        piętro: Number.parseInt(row.children[2]?.lastChild?.nodeValue),
        metraż: Number.parseFloat(row.children[3]?.lastChild?.nodeValue),
        liczbaPokoi: Number.parseInt(row.children[4]?.lastChild?.nodeValue),
        odbiór: row.children[5]?.lastChild?.nodeValue,
        status: row.children[6]?.lastChild?.nodeValue,
        cena: cenaParser(row.children[7]?.lastChild?.nodeValue),
        detailsUrl: row.children[9]?.lastChild?.attribs['href']
    };

    result.id = `${result.budynek}-${result.nrLokalu}`;

    return result;
}

function cenaParser(rawCena: string | null): number | undefined {
    const cenaStr = rawCena?.replace(/zł|\s/, '');
    return cenaStr
        ? Number.parseInt(cenaStr)
        : undefined;
}