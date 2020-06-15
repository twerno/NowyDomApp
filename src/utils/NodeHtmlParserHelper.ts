import { IRawData } from '../dataProvider/IOfertaRecord';
import { HTMLElement } from 'node-html-parser';

export default {
    loadString,
    loadInt,
    loadFloat
}

function loadString(element: HTMLElement | undefined): string {
    return element?.text?.trim() || '';
}

function loadInt(element: HTMLElement | undefined): number | IRawData {
    const text = loadString(element);
    const result = Number.parseInt(text, 10);

    return isNaN(result)
        ? { raw: text || '' }
        : result;
}

const floatRegExpr = /([\d,.]+)/;

function loadFloat(element: HTMLElement | undefined): number | IRawData {
    const text = loadString(element);
    const float = floatRegExpr.exec(text);
    if (float === null || float[1] === null) {
        return { raw: text || '' }
    }
    const result = Number.parseFloat(float[1].replace(/,/g, '.'));

    return isNaN(result)
        ? { raw: text || '' }
        : result;
}