import cheerio from 'cheerio';
import { IRawData } from 'core/oferta/model/IOfertaModel';

export default {
    loadString,
    loadInt,
    loadFloat
}

function loadString(element: CheerioElement): string {
    return cheerio(element)?.text()?.trim() || '';
}

function loadInt(element: CheerioElement): number | IRawData {
    const text = cheerio(element)?.text();
    const result = Number.parseInt(text, 10);

    return isNaN(result)
        ? { raw: text || '' }
        : result;
}

const floatRegExpr = /([\d,.]+)/;

function loadFloat(element: CheerioElement): number | IRawData {
    const text = cheerio(element)?.text();
    const float = floatRegExpr.exec(text);
    if (float === null || float[1] === null) {
        return { raw: text || '' }
    }
    const result = Number.parseFloat(float[1].replace(/,/g, '.'));

    return isNaN(result)
        ? { raw: text || '' }
        : result;
}