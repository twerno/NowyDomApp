import cheerio from 'cheerio';
import { IRawData } from 'dataProvider/IOfertaRecord';

export default {
    loadString,
    loadInt,
    loadFloat
}

function loadString(element: CheerioElement): string {
    return cheerio(element)?.text() || '';
}

function loadInt(element: CheerioElement): number | IRawData {
    const text = cheerio(element)?.text();
    const result = Number.parseInt(text, 10);

    return isNaN(result)
        ? { raw: text || '' }
        : result;
}

function loadFloat(element: CheerioElement): number | IRawData {
    const text = cheerio(element)?.text();
    const result = Number.parseFloat(text);

    return isNaN(result)
        ? { raw: text || '' }
        : result;
}