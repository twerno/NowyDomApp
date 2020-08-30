import { inwestycjeMap } from '@src/inwestycje/inwestycje';
import Excel from 'exceljs';
import { IOfertaRecord } from '../model/IOfertaModel';
import { OdbiorTypeHelper } from '../model/OdbiorType';
import { StatusHelper } from '../model/Status';
import { StronaSwiataHelper } from '../model/StronySwiata';
import { TypHelper } from '../model/Typ';
import { IEnv } from '../tasks/IEnv';
import ExcelUtils from './ExcelUtils';
import { buildOpeLogList, buildOpeRecordLogMap, opeLogSort } from './OpeLogBuilder';
import { OfferExcelStatsBuilder } from './OfferExcelStatsBuilder';

export async function buildExcel(env: IEnv) {

    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet('Stan');
    const zmianySheet = workbook.addWorksheet('Zmiany');
    const statsSheet = workbook.addWorksheet('Statystyki');

    const stanList = await env.stanService.getAll();

    await prepareOfertaStanSheet(sheet, stanList);
    await prepareZmianaStanSheet(zmianySheet, stanList, env);
    OfferExcelStatsBuilder(statsSheet, stanList);

    console.log('plik raport.xlsx został wygenerowany');

    return workbook.xlsx.writeBuffer();
}

async function prepareOfertaStanSheet(sheet: Excel.Worksheet, stanList: IOfertaRecord[]) {

    sheet.views = [
        { state: 'frozen', xSplit: 2, ySplit: 1, activeCell: 'A1' }
    ];

    ExcelUtils.registerColumns(sheet,
        [
            ExcelUtils.column('Inwestycja', { width: 20 }),
            ExcelUtils.column('Lokal', { width: 9 }),
            ExcelUtils.column('Metraż', { numFmt: '# ##0.00 "m²"', width: 10 }),
            ExcelUtils.column('Liczba pokoi'),
            ExcelUtils.column('Cena', { numFmt: '# ##0.00 [$PLN]' }),
            ExcelUtils.column('Cena za metr', { numFmt: '# ##0.00 [$PLN]' }),
            ExcelUtils.column('Piętro'),
            ExcelUtils.column('Kondygnacje'),
            ExcelUtils.column('Oferta'),
            ExcelUtils.column('Odbiór'),
            ExcelUtils.column('Strony świata'),
            ExcelUtils.column('Dodane'),
            ExcelUtils.column('Sprzedane'),
            ExcelUtils.column('Lokalizacja', { width: 15 }),
            ExcelUtils.column('Typ'),
            ExcelUtils.column('Status', { hidden: false }),
            ExcelUtils.column('Id'),
            ExcelUtils.column('Developer'),
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
                    'Metraż': ExcelUtils.number2Excel(v.data.metraz),
                    'Cena': ExcelUtils.number2Excel(v.data.cena),
                    'Kondygnacje': ExcelUtils.number2Excel(v.data.liczbaKondygnacji),
                    'Liczba pokoi': ExcelUtils.number2Excel(v.data.lpPokoj),
                    'Oferta': ExcelUtils.ofertaUrl(v),
                    'Odbiór': OdbiorTypeHelper.odbior2Str(v.data.odbior),
                    'Piętro': ExcelUtils.number2Excel(v.data.pietro),
                    'Lokalizacja': inwestycjeMap[v.inwestycjaId]?.miasto,
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

    ExcelUtils.registerColumns(sheet,
        [
            ExcelUtils.column('Kiedy', { width: 12 }),
            ExcelUtils.column('Gdzie', { width: 20 }),
            ExcelUtils.column('Developer'),
            ExcelUtils.column('Mieszkanie', { width: 28 }),
            ExcelUtils.column('Metraż', { numFmt: '# ##0.00 "m²"', width: 10 }),
            ExcelUtils.column('Liczba pokoi', { width: 10 }),
            ExcelUtils.column('Opis', { width: 100 }),
            ExcelUtils.column('Wersja', { width: 10 }),
        ]
    );

    logList
        .sort(opeLogSort)
        .forEach(v => sheet.addRow({
            'Kiedy': new Date(v.timestamp).toLocaleDateString(),
            'Gdzie': inwestycjeMap[v.inwestycjaId]?.miasto,
            'Developer': v.stan?.developerId,
            'Mieszkanie': v.ofertaId,
            'Metraż': v.typ === 'grupa' ? '' : v.stan?.data.metraz,
            'Liczba pokoi': v.typ === 'grupa' ? '' : ExcelUtils.number2Excel(v.stan?.data.lpPokoj),
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
    sheet.addConditionalFormatting({
        ref: `A2:B${recordList.length + 1}`,
        rules: [
            {
                type: 'expression', formulae: [`$${statusCol.letter}2="Wolne"`],
                style: {
                    fill: ExcelUtils.solidBgPattern(ExcelUtils.colors.wolnyColor),
                    border: { right: { style: 'thin', color: { argb: '000000' } } }
                }
            },
            {
                type: 'expression', formulae: [`$${statusCol.letter}2="Rezerwacja"`],
                style: { fill: ExcelUtils.solidBgPattern(ExcelUtils.colors.rezerwacjaKolor) }
            },
            {
                type: 'expression', formulae: [`$${statusCol.letter}2="Sprzedane"`],
                style: { fill: ExcelUtils.solidBgPattern(ExcelUtils.colors.sprzedaneColor) }
            },
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
