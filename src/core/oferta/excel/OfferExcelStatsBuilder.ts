import Excel, { CellFormulaValue } from 'exceljs';
import { IOfertaRecord, IRawData, isRawData, ZASOBY } from '../model/IOfertaModel';
import { OdbiorTypeHelper } from '../model/OdbiorType';
import { StatusHelper, Status } from '../model/Status';
import { StronaSwiataHelper } from '../model/StronySwiata';
import { TypHelper } from '../model/Typ';
import { IEnv } from '../tasks/IEnv';
import { buildOpeLogList, buildOpeRecordLogMap, opeLogSort } from './OpeLogBuilder';
import { inwestycjeMap } from '@src/inwestycje/inwestycje';
import ExcelUtils from './ExcelUtils';
import { FileSystemCredentials } from 'aws-sdk';
import CommConv from '@src/core/utils/CommConv';
import { IDataProvider } from '../IOfertaProvider';

export const OfferExcelStatsBuilder = (statsSheet: Excel.Worksheet, statsRulesSheet: Excel.Worksheet) => {

    const months = calculateMonths(new Date('06.01.2020'), new Date());

    header(statsSheet, months);
    fillWithValues(statsSheet, months, statsRulesSheet);

}

const header = (statsSheet: Excel.Worksheet, months: TMonths) => {
    const firstRow = statsSheet.getRow(1);
    firstRow.getCell(4).value = 'Stan';
    firstRow.getCell(4).style.alignment = { horizontal: 'center' };
    statsSheet.mergeCells('D1:G1');

    let colIdx = 1;
    const row = statsSheet.getRow(2);
    row.getCell(colIdx++).value = 'Inwestycja';
    row.getCell(colIdx++).value = 'Lokalizacja';
    row.getCell(colIdx++).value = 'Filtr';
    row.getCell(colIdx++).value = 'Wszystkie';
    row.getCell(colIdx++).value = 'Wolne';
    row.getCell(colIdx++).value = 'Sprzedane';
    row.getCell(colIdx++).value = 'Rezerwacja';

    months.forEach(month => {
        firstRow.getCell(colIdx).value = `${CommConv.miesiac2str(month.month)} ${month.year}`;
        firstRow.getCell(colIdx).style.alignment = { horizontal: 'center' };
        statsSheet.mergeCells(`${firstRow.getCell(colIdx).address}:${firstRow.getCell(colIdx + 2).address}`);

        row.getCell(colIdx++).value = 'Wolne';
        row.getCell(colIdx++).value = 'Sprzedane';
        row.getCell(colIdx++).value = 'Rezerwacja';
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

const fillWithValues = (statsSheet: Excel.Worksheet, months: TMonths, statsRulesSheet: Excel.Worksheet) => {
    const inwestycje = Object.entries(inwestycjeMap).sort((a, b) => a[0].localeCompare(b[0]));

    const dataRowIdx = 3;
    let rowIdx = 0;

    for (let i = 0; i < inwestycje.length; i++) {
        const inwestycja = inwestycje[i][1];
        if (inwestycja === undefined) {
            continue;
        }
        const row = statsSheet.getRow(rowIdx++);

        buildRows(statsSheet.getRow(dataRowIdx + rowIdx), rowIdx++, i, inwestycja, months, RowFilter.ALL, statsRulesSheet);
        buildRows(statsSheet.getRow(dataRowIdx + rowIdx), rowIdx++, i, inwestycja, months, RowFilter.ROOMS_2, statsRulesSheet);
        buildRows(statsSheet.getRow(dataRowIdx + rowIdx), rowIdx++, i, inwestycja, months, RowFilter.ROOMS_3, statsRulesSheet);
        buildRows(statsSheet.getRow(dataRowIdx + rowIdx), rowIdx++, i, inwestycja, months, RowFilter.ROOMS_4, statsRulesSheet);
    }
}

function buildRows(row: Excel.Row, rowIdx: number, inwestycjaIdx: number, inwestycja: IDataProvider, months: TMonths, filter: RowFilter, statsRulesSheet: Excel.Worksheet) {

    let colIdx = 1;
    row.getCell(colIdx++).value = inwestycja.inwestycjaId;
    row.getCell(colIdx++).value = inwestycja.lokalizacja;
    row.getCell(colIdx++).value = RowFilterLabelConv[filter];

    const queryRowIdx = rowIdx * 4 + 1;

    let queryColStartIdx = 1;
    let queryColEndIdx = buildQuery(queryRowIdx, queryColStartIdx, filter, inwestycja, null, statsRulesSheet);
    row.getCell(colIdx++).value = getFormula(queryRowIdx, queryColStartIdx, queryColEndIdx, statsRulesSheet);
    queryColStartIdx = queryColEndIdx + 2;

    queryColEndIdx = buildQuery(queryRowIdx, queryColStartIdx, filter, inwestycja, Status.WOLNE, statsRulesSheet);
    row.getCell(colIdx++).value = getFormula(queryRowIdx, queryColStartIdx, queryColEndIdx, statsRulesSheet);
    queryColStartIdx = queryColEndIdx + 2;

    queryColEndIdx = buildQuery(queryRowIdx, queryColStartIdx, filter, inwestycja, Status.SPRZEDANE, statsRulesSheet);
    row.getCell(colIdx++).value = getFormula(queryRowIdx, queryColStartIdx, queryColEndIdx, statsRulesSheet);
    queryColStartIdx = queryColEndIdx + 2;

    queryColEndIdx = buildQuery(queryRowIdx, queryColStartIdx, filter, inwestycja, Status.REZERWACJA, statsRulesSheet);
    row.getCell(colIdx++).value = getFormula(queryRowIdx, queryColStartIdx, queryColEndIdx, statsRulesSheet);
    queryColStartIdx = queryColEndIdx + 2;

    // queryColEndIdx = buildFilterStan(rowAbsoluteIdx * 3 + 1, filterEndIdx + 2, filter, inwestycja, Status.WOLNE, statsRulesSheet);
    // row.getCell(colIdx++).value = getFormula(queryRowIdx, queryColStartIdx, queryColEndIdx, statsRulesSheet);
    // { formula: `DCOUNTA($Stan.A:P,,$${statsRulesSheet.name}.${statsRulesSheet.getCell(1, 1).address}:C3)`, date1904: false };
    // DCOUNTA

    // filterEndIdx = buildFilterStan(rowAbsoluteIdx * 3 + 1, filterEndIdx + 2, filter, inwestycja, Status.SPRZEDANE, statsRulesSheet);
    // filterEndIdx = buildFilterStan(rowAbsoluteIdx * 3 + 1, filterEndIdx + 2, filter, inwestycja, Status.REZERWACJA, statsRulesSheet);
    // row.getCell(colIdx++).value = 'Wszystkie';
    // row.getCell(colIdx++).value = 'Wolne';
    // row.getCell(colIdx++).value = 'Sprzedane';
    // row.getCell(colIdx++).value = 'Rezerwacja';
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

function buildQuery(rowIdx: number, colIdx: number, filter: RowFilter, inwestycja: IDataProvider, status: Status | null, statsRulesSheet: Excel.Worksheet) {
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

function getFormula(queryRow: number, queryColStart: number, queryColEnd: number, statsRulesSheet: Excel.Worksheet): CellFormulaValue {

    const querySheetName = `${statsRulesSheet.name}`;
    const queryCell1 = statsRulesSheet.getCell(queryRow, queryColStart).address;
    const queryCell2 = statsRulesSheet.getCell(queryRow + 1, queryColEnd).address;

    return {
        formula: `DCOUNTA(Stan!A:P,,${querySheetName}!${queryCell1}:${queryCell2})`,
        date1904: true
    };
}