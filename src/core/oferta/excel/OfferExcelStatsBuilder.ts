import CommConv from '@src/core/utils/CommConv';
import { inwestycjeMap } from '@src/inwestycje/inwestycje';
import Excel, { CellFormulaValue } from 'exceljs';
import { IDataProvider } from '../IOfertaProvider';
import { Status, StatusHelper } from '../model/Status';

export const OfferExcelStatsBuilder = (statsSheet: Excel.Worksheet, statsRulesSheet: Excel.Worksheet) => {

    const months = calculateMonths(new Date('06.01.2020'), new Date());

    buildHeader(statsSheet, months);
    buildRows(statsSheet, months, statsRulesSheet);

}

const buildHeader = (statsSheet: Excel.Worksheet, months: TMonths) => {
    const groupRow = statsSheet.getRow(1);
    groupRow.getCell(4).value = 'Stan';
    groupRow.getCell(4).style.alignment = { horizontal: 'center' };
    statsSheet.mergeCells('D1:G1');

    let colIdx = 1;
    const headerRow = statsSheet.getRow(2);
    statsSheet.getColumn(colIdx).width = 20;
    headerRow.getCell(colIdx++).value = 'Inwestycja';

    statsSheet.getColumn(colIdx).width = 16;
    headerRow.getCell(colIdx++).value = 'Lokalizacja';

    statsSheet.getColumn(colIdx).width = 12;
    headerRow.getCell(colIdx++).value = 'Filtr';

    statsSheet.getColumn(colIdx).border = { left: { style: "thin", color: { argb: '000' } } };
    headerRow.getCell(colIdx++).value = 'All';
    headerRow.getCell(colIdx++).value = 'Free';
    headerRow.getCell(colIdx++).value = 'Sold';
    headerRow.getCell(colIdx++).value = 'Reserved';

    months.forEach(month => {
        groupRow.getCell(colIdx).value = `${CommConv.miesiac2str(month.month)} ${month.year}`;
        groupRow.getCell(colIdx).style.alignment = { horizontal: 'center' };
        statsSheet.mergeCells(`${groupRow.getCell(colIdx).address}:${groupRow.getCell(colIdx + 2).address}`);
        statsSheet.getColumn(colIdx).border = {
            left: { style: "thin", color: { argb: '000' } },
            right: { style: "thin", color: { argb: '000' } }
        };

        headerRow.getCell(colIdx++).value = 'Free';
        headerRow.getCell(colIdx++).value = 'Sold';
        headerRow.getCell(colIdx++).value = 'Reserved';
    });
}

type TMonth = { month: number, year: number };
type TMonths = TMonth[];

function calculateMonths(from: Date, to: Date) {
    const result: TMonths = [];

    let month = from.getMonth();
    let year = from.getFullYear();

    result.push({ month, year });

    while (year < to.getFullYear() || month < to.getMonth()) {
        if (++month >= 12) {
            month = 0;
            year++;
        }
        result.push({ month, year });
    }

    return result;
}

const buildRows = (statsSheet: Excel.Worksheet, months: TMonths, statsRulesSheet: Excel.Worksheet) => {
    const inwestycje = Object.entries(inwestycjeMap).sort((a, b) => a[0].localeCompare(b[0]));

    const dataRowIdx = 3;
    let rowIdx = 0;

    for (const [_, inwestycja] of inwestycje) {
        if (inwestycja === undefined) {
            continue;
        }
        const row = statsSheet.getRow(rowIdx++);

        buildRow(statsSheet.getRow(dataRowIdx + rowIdx), rowIdx++, inwestycja, months, RowFilter.ALL, statsRulesSheet);
        buildRow(statsSheet.getRow(dataRowIdx + rowIdx), rowIdx++, inwestycja, months, RowFilter.ROOMS_2, statsRulesSheet);
        buildRow(statsSheet.getRow(dataRowIdx + rowIdx), rowIdx++, inwestycja, months, RowFilter.ROOMS_3, statsRulesSheet);
        buildRow(statsSheet.getRow(dataRowIdx + rowIdx), rowIdx++, inwestycja, months, RowFilter.ROOMS_4, statsRulesSheet);
    }
}

const ROWS_PER_INWESTYCJA = 4;

function buildRow(row: Excel.Row, rowIdx: number, inwestycja: IDataProvider, months: TMonths, filter: RowFilter, statsRulesSheet: Excel.Worksheet) {

    let colIdx = 1;
    row.getCell(colIdx++).value = inwestycja.inwestycjaId;
    row.getCell(colIdx++).value = inwestycja.lokalizacja;
    row.getCell(colIdx++).value = RowFilterLabelConv[filter];

    const queryRowIdx = rowIdx * ROWS_PER_INWESTYCJA + 1;

    let queryColStartIdx = 1;
    let queryColEndIdx = -1;
    [null, Status.WOLNE, Status.SPRZEDANE, Status.REZERWACJA]
        .forEach(status => {
            queryColEndIdx = buildQueryForStan(queryRowIdx, queryColStartIdx, filter, inwestycja, status, statsRulesSheet);
            row.getCell(colIdx++).value = getFormula(queryRowIdx, queryColStartIdx, queryColEndIdx, statsRulesSheet);
            queryColStartIdx = queryColEndIdx + 2;
        });

    months.forEach(month => {

        queryColEndIdx = buildQueryForMonthWolne(queryRowIdx, queryColStartIdx, filter, inwestycja, month, statsRulesSheet);
        row.getCell(colIdx++).value = getFormula(queryRowIdx, queryColStartIdx, queryColEndIdx, statsRulesSheet);
        row.getCell(colIdx++).value = getFormula(queryRowIdx, queryColStartIdx, queryColEndIdx, statsRulesSheet);
        row.getCell(colIdx++).value = getFormula(queryRowIdx, queryColStartIdx, queryColEndIdx, statsRulesSheet);
        queryColStartIdx = queryColEndIdx + 2;
    })

}

enum RowFilter {
    ALL = '',
    ROOMS_2 = 2,
    ROOMS_3 = 3,
    ROOMS_4 = 4
}

const RowFilterLabelConv = {
    [RowFilter.ALL]: '',
    [RowFilter.ROOMS_2]: '2-pokojowe',
    [RowFilter.ROOMS_3]: '3-pokojowe',
    [RowFilter.ROOMS_4]: '4-pokojowe',
}

function buildQueryForStan(rowIdx: number, colIdx: number, filter: RowFilter, inwestycja: IDataProvider, status: Status | null, statsRulesSheet: Excel.Worksheet) {
    let row = statsRulesSheet.getRow(rowIdx);
    row.getCell(colIdx).value = 'Inwestycja';
    row.getCell(colIdx + 1).value = 'Liczba pokoi';
    row.getCell(colIdx + 2).value = 'Status';

    row = statsRulesSheet.getRow(rowIdx + 1);
    row.getCell(colIdx).value = inwestycja.inwestycjaId;
    row.getCell(colIdx + 1).value = filter;
    row.getCell(colIdx + 2).value = StatusHelper.status2string(status);

    return colIdx + 2;
}

function buildQueryForMonthWolne(rowIdx: number, colIdx: number, filter: RowFilter, inwestycja: IDataProvider, month: TMonth, statsRulesSheet: Excel.Worksheet) {
    let row = statsRulesSheet.getRow(rowIdx);
    row.getCell(colIdx).value = 'Inwestycja';
    row.getCell(colIdx + 1).value = 'Liczba pokoi';
    row.getCell(colIdx + 2).value = 'Status';
    row.getCell(colIdx + 3).value = 'Sprzedane';
    row.getCell(colIdx + 4).value = 'Dodane';

    const nextMonth = getNextMonth(month);

    row = statsRulesSheet.getRow(rowIdx + 1);
    row.getCell(colIdx).value = inwestycja.inwestycjaId;
    row.getCell(colIdx + 1).value = filter;
    row.getCell(colIdx + 2).value = '';
    row.getCell(colIdx + 3).value = `>=1.${nextMonth.month + 1}.${nextMonth.year}`;
    row.getCell(colIdx + 4).value = ``;

    row = statsRulesSheet.getRow(rowIdx + 2);
    row.getCell(colIdx).value = inwestycja.inwestycjaId;
    row.getCell(colIdx + 1).value = filter;
    row.getCell(colIdx + 2).value = StatusHelper.status2string(Status.WOLNE);
    row.getCell(colIdx + 3).value = '';
    row.getCell(colIdx + 4).value = `<1.${nextMonth.month + 1}.${nextMonth.year}`;

    return colIdx + 4;
}

function getFormula(queryRow: number, queryColStart: number, queryColEnd: number, statsRulesSheet: Excel.Worksheet): CellFormulaValue {

    const querySheetName = `${statsRulesSheet.name}`;
    const queryCell1 = statsRulesSheet.getCell(queryRow, queryColStart).address;
    const queryCell2 = statsRulesSheet.getCell(queryRow + 1, queryColEnd).address;

    return {
        formula: `DCOUNTA(Stan!A:P,,${querySheetName}!${queryCell1}:${queryCell2})`,
        date1904: true
    };
}

function getNextMonth(month: TMonth): TMonth {
    return {
        month: month.month === 11 ? 0 : month.month + 1,
        year: month.month === 11 ? month.year + 1 : month.year
    };
}