import Excel from 'exceljs';
import { IRawData, isRawData, IOfertaRecord } from '../model/IOfertaModel';
import { OdbiorTypeHelper } from '../model/OdbiorType';
import { Status, StatusHelper } from '../model/Status';
import { StronaSwiataHelper } from '../model/StronySwiata';
import { TypHelper } from '../model/Typ';
import { IEnv } from '../tasks/IEnv';

export async function buildExcel(env: IEnv) {

    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet('Stan');

    await writeOfertaStanSheet(sheet, env);

    await workbook.xlsx.writeFile('test.xlsx');
    console.log('plik test.xlsx został wygenerowany');
}

async function writeOfertaStanSheet(sheet: Excel.Worksheet, env: IEnv) {
    const stanList = await env.stanService.getAll();

    sheet.views = [
        { state: 'frozen', xSplit: 3, ySplit: 1, activeCell: 'A1' }
    ];

    registerColumns(sheet,
        [
            column('Inwestycja', { width: 12 }),
            column('Lokal', { width: 9 }),
            column('Metraż', { numFmt: '# ##0.00 "m²"', width: 10 }),
            column('Status', { hidden: true }),
            column('Dodane'),
            column('Sprzedane'),
            column('Cena', { numFmt: '# ##0.00 [$PLN]' }),
            column('Cena za metr', { numFmt: '# ##0.00 [$PLN]' }),
            column('Kondygnacje'),
            column('Liczba pokoi'),
            column('Odbiór'),
            column('Piętro'),
            column('Typ'),
            column('Strony świata'),
            column('Id'),
            column('Developer'),
        ]
    );

    setColStyle(sheet, stanList);

    stanList
        .sort(sortFn)
        .forEach(v => {
            const row = sheet.addRow(
                {
                    'Inwestycja': v.inwestycjaId,
                    'Lokal': v.ofertaId.replace(`${v.inwestycjaId}-`, ''),
                    'Dodane': new Date(v.created_at),
                    'Sprzedane': v.data.sprzedaneData ? new Date(v.data.sprzedaneData) : undefined,
                    'Status': StatusHelper.status2string(v.data.status === Status.USUNIETA ? Status.SPRZEDANE : v.data.status),
                    'Metraż': number2Excel(v.data.metraz),
                    'Cena': number2Excel(v.data.cena),
                    'Kondygnacje': v.data.liczbaKondygnacji,
                    'Liczba pokoi': valOrRaw2Str(v.data.lpPokoj),
                    'Odbiór': OdbiorTypeHelper.odbior2Str(v.data.odbior),
                    'Piętro': valOrRaw2Str(v.data.pietro),
                    'Typ': TypHelper.typ2str(v.data.typ),
                    'Strony świata': v.data.stronySwiata?.map(StronaSwiataHelper.stronaSwiata2Short).join(', '),
                    "Id": v.ofertaId,
                    'Developer': v.developerId,

                }
            );

            const cellAdress = `${sheet.getColumn('Cena za metr').letter}${row.number}`;
            const cenaLetter = sheet.getColumn('Cena').letter;
            const metrazLetter = sheet.getColumn('Metraż').letter;
            sheet.getCell(cellAdress).value =
            {
                formula: `=${cenaLetter}${row.number}/${metrazLetter}${row.number}`,
                date1904: false
            };
        }

        );
}

function sortFn(a: IOfertaRecord, b: IOfertaRecord): number {
    const comp1 = a.developerId.localeCompare(b.developerId);
    if (comp1 !== 0) {
        return comp1;
    }

    const comp2 = a.inwestycjaId.localeCompare(b.inwestycjaId);
    if (comp2 !== 0) {
        return comp2;
    }

    const metrazA = typeof a.data.metraz === 'number' ? a.data.metraz : 0;
    const metrazB = typeof b.data.metraz === 'number' ? b.data.metraz : 0;

    return metrazB - metrazA;
}

function setColStyle(sheet: Excel.Worksheet, recordList: any[]) {
    const statusCol = sheet.getColumn('Status');

    // kolorowanie statusu
    const wolnyColor = 'd4ea6b';
    const rezerwacjaKolor = 'ffffa6';
    const sprzedaneColor = 'ff6d6d';
    sheet.addConditionalFormatting({
        ref: `A2:C${recordList.length + 1}`,
        rules: [
            { type: 'expression', formulae: [`$${statusCol.letter}2="Wolne"`], style: { fill: solidBgPattern(wolnyColor), border: { right: { style: 'thin', color: { argb: '000000' } } } } },
            { type: 'expression', formulae: [`$${statusCol.letter}2="Rezerwacja"`], style: { fill: solidBgPattern(rezerwacjaKolor) } },
            { type: 'expression', formulae: [`$${statusCol.letter}2="Sprzedane"`], style: { fill: solidBgPattern(sprzedaneColor) } },
        ]
    });

    sheet.addConditionalFormatting({
        ref: `${statusCol.letter}2:${statusCol.letter}${recordList.length + 1}`,
        rules: [
            cellEqualsRule('"Wolne"', { fill: solidBgPattern(wolnyColor) }),
            cellEqualsRule('"Rezerwacja"', { fill: solidBgPattern(rezerwacjaKolor) }),
            cellEqualsRule('"Sprzedane"', { fill: solidBgPattern(sprzedaneColor) }),
        ]
    });
}

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