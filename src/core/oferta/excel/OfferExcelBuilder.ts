import Excel from 'exceljs';
import { IOfertaRecord, IRawData, isRawData, ZASOBY } from '../model/IOfertaModel';
import { OdbiorTypeHelper } from '../model/OdbiorType';
import { StatusHelper } from '../model/Status';
import { StronaSwiataHelper } from '../model/StronySwiata';
import { TypHelper } from '../model/Typ';
import { IEnv } from '../tasks/IEnv';
import { buildOpeLogList, buildOpeRecordLogMap, opeLogSort } from './OpeLogBuilder';
import { inwestycjeMap } from '@src/inwestycje/inwestycje';

export async function buildExcel(env: IEnv) {

    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet('Stan');
    const zmianySheet = workbook.addWorksheet('Zmiany');

    const stanList = await env.stanService.getAll();

    await prepareOfertaStanSheet(sheet, stanList);
    await prepareZmianaStanSheet(zmianySheet, stanList, env);

    await workbook.xlsx.writeFile('raport.xlsx');

    console.log('plik raport.xlsx został wygenerowany');
}

async function prepareOfertaStanSheet(sheet: Excel.Worksheet, stanList: IOfertaRecord[]) {

    sheet.views = [
        { state: 'frozen', xSplit: 2, ySplit: 1, activeCell: 'A1' }
    ];

    registerColumns(sheet,
        [
            column('Inwestycja', { width: 20 }),
            column('Lokal', { width: 9 }),
            column('Metraż', { numFmt: '# ##0.00 "m²"', width: 10 }),
            column('Liczba pokoi'),
            column('Cena', { numFmt: '# ##0.00 [$PLN]' }),
            column('Cena za metr', { numFmt: '# ##0.00 [$PLN]' }),
            column('Piętro'),
            column('Kondygnacje'),
            column('Oferta'),
            column('Odbiór'),
            column('Strony świata'),
            column('Dodane'),
            column('Sprzedane'),
            column('Lokalizacja', { width: 15 }),
            column('Typ'),
            column('Status', { hidden: false }),
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
                    'Status': StatusHelper.status2string(v.data.status),
                    'Metraż': number2Excel(v.data.metraz),
                    'Cena': number2Excel(v.data.cena),
                    'Kondygnacje': number2Excel(v.data.liczbaKondygnacji),
                    'Liczba pokoi': number2Excel(v.data.lpPokoj),
                    'Oferta': ofertaUrl(v),
                    'Odbiór': OdbiorTypeHelper.odbior2Str(v.data.odbior),
                    'Piętro': number2Excel(v.data.pietro),
                    'Lokalizacja': inwestycjeMap[v.inwestycjaId]?.lokalizacja,
                    'Typ': TypHelper.typ2str(v.data.typ),
                    'Strony świata': v.data.stronySwiata?.map(StronaSwiataHelper.stronaSwiata2Short).join(', '),
                    "Id": v.ofertaId,
                    'Developer': v.developerId,
                }
                , ''
            );

            const cellAdress = `${sheet.getColumn('Cena za metr').letter}${row.number}`;
            const cenaLetter = sheet.getColumn('Cena').letter;
            const metrazLetter = sheet.getColumn('Metraż').letter;
            sheet.getCell(cellAdress).value =
            {
                formula: `IF(COUNTBLANK(${cenaLetter}${row.number}) > 0, "", ${cenaLetter}${row.number}/${metrazLetter}${row.number})`,
                date1904: false
            };
        }

        );
}

async function prepareZmianaStanSheet(sheet: Excel.Worksheet, stanList: IOfertaRecord[], env: IEnv) {

    const opeList = await env.opeService.getAll();

    const opeLogMap = buildOpeRecordLogMap(stanList, opeList);

    const logList = buildOpeLogList(stanList, opeLogMap);

    registerColumns(sheet,
        [
            column('Kiedy', { width: 12 }),
            column('Gdzie', { width: 20 }),
            column('Developer'),
            column('Mieszkanie', { width: 28 }),
            column('Metraż', { numFmt: '# ##0.00 "m²"', width: 10 }),
            column('Liczba pokoi', { width: 10 }),
            column('Opis', { width: 100 }),
            column('Wersja', { width: 10 }),
        ]
    );

    logList
        .sort(opeLogSort)
        .forEach(v => sheet.addRow({
            'Kiedy': new Date(v.timestamp).toLocaleDateString(),
            'Gdzie': inwestycjeMap[v.inwestycjaId]?.lokalizacja,
            'Developer': v.stan?.developerId,
            'Mieszkanie': v.ofertaId,
            'Metraż': v.typ === 'grupa' ? '' : v.stan?.data.metraz,
            'Liczba pokoi': v.typ === 'grupa' ? '' : number2Excel(v.stan?.data.lpPokoj),
            'Opis': { 'richText': v.richMessage },
            'Wersja': v.version,
        }, ''));
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
        ref: `A2:B${recordList.length + 1}`,
        rules: [
            { type: 'expression', formulae: [`$${statusCol.letter}2="Wolne"`], style: { fill: solidBgPattern(wolnyColor), border: { right: { style: 'thin', color: { argb: '000000' } } } } },
            { type: 'expression', formulae: [`$${statusCol.letter}2="Rezerwacja"`], style: { fill: solidBgPattern(rezerwacjaKolor) } },
            { type: 'expression', formulae: [`$${statusCol.letter}2="Sprzedane"`], style: { fill: solidBgPattern(sprzedaneColor) } },
        ]
    });

    // sheet.addConditionalFormatting({
    //     ref: `${statusCol.letter}2:${statusCol.letter}${recordList.length + 1}`,
    //     rules: [
    //         cellEqualsRule('"Wolne"', { fill: solidBgPattern(wolnyColor) }),
    //         cellEqualsRule('"Rezerwacja"', { fill: solidBgPattern(rezerwacjaKolor) }),
    //         cellEqualsRule('"Sprzedane"', { fill: solidBgPattern(sprzedaneColor) }),
    //     ]
    // });
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