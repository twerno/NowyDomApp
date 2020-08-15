import Excel from 'exceljs';
import { IOfertaRecord, IRawData, isRawData, ZASOBY } from '../model/IOfertaModel';

const colors = {
    wolnyColor: 'd4ea6b',
    rezerwacjaKolor: 'ffffa6',
    sprzedaneColor: 'ff6d6d',
    darkGreen: '069a2e',
    darkRed: 'ff0000',
    darkYellow: 'b4a200',
    navy: '00739c'
}

export default {
    valOrRaw2Str,
    registerColumns,
    column,
    number2Excel,
    solidBgPattern,
    cellEqualsRule,
    ofertaUrl,
    colors,
    solidFgPattern
};

function valOrRaw2Str<T>(valOrRaw: T | IRawData, mapper?: (val: T) => string): string | null {
    const val = isRawData(valOrRaw)
        ? valOrRaw.raw
        : !!mapper
            ? mapper(valOrRaw)
            : valOrRaw;

    if (val === null || val === undefined) {
        return null;
    }
    return typeof val === 'string'
        ? val
        : JSON.stringify(val);
}

function registerColumns(
    sheet: Excel.Worksheet,
    columns: Array<Required<Pick<Excel.Column, 'header' | 'key'>> & Partial<Pick<Excel.Column, 'width' | 'numFmt'>>>
) {
    sheet.columns = columns;

    columns.forEach(colDef => {
        const column = sheet.getColumn(colDef.key);
        column.numFmt = colDef.numFmt;
    })
}

function column(
    header: string,
    props?: Partial<Pick<Excel.Column, 'width' | 'numFmt' | 'hidden'>>
) {
    return {
        ...props,
        header,
        key: header,
        width: props?.width || 15,
    }
}

function number2Excel(cena: number | IRawData | undefined | null): number | string | null {
    if (cena === null || cena === undefined) {
        return null;
    }

    if (isRawData(cena)) {
        return cena.raw || '';
    }

    return cena;
}

function solidBgPattern(color: string): Excel.FillPattern {
    return {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {},
        bgColor: {
            argb: color
        }
    };
}

function solidFgPattern(color: string): Excel.FillPattern {
    return {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: color },
    };
}

function cellEqualsRule(formulae: string, style: Partial<Excel.Style>): Excel.CellIsRuleType {
    return (
        {
            type: 'cellIs',
            operator: 'equal',
            formulae: [formulae],
            style,
        }
    );
}

function ofertaUrl(record: IOfertaRecord) {
    const filename = record.data.zasobyPobrane?.find(v => v.id === ZASOBY.PDF)
        || record.data.zasobyPobrane?.find(v => v.id === ZASOBY.IMG);

    if (!filename) {
        return null;
    }

    return {
        text: filename.id,
        hyperlink: `https://nowydom.s3-eu-west-1.amazonaws.com/${record.inwestycjaId}/${filename.s3Filename}`,
    };
}