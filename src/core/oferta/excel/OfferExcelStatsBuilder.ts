import CommConv from '@src/core/utils/CommConv';
import { inwestycjeMap } from '@src/inwestycje/inwestycje';
import Excel from 'exceljs';
import { IDataProvider } from '../IOfertaProvider';
import { IOfertaRecord } from '../model/IOfertaModel';
import { Status } from '../model/Status';
import ExcelUtils from './ExcelUtils';
import Utils from '@src/utils/Utils';

export const OfferExcelStatsBuilder = (statsSheet: Excel.Worksheet, stanList: IOfertaRecord[]) => {

    const months = calculateMonths(new Date('06.01.2020'), new Date());

    statsSheet.views = [
        { state: 'frozen', ySplit: 2, activeCell: 'A1' }
    ];

    buildHeader(statsSheet, months);
    buildRows(statsSheet, months, stanList);

}

const buildHeader = (statsSheet: Excel.Worksheet, months: TMonths) => {
    const groupRow = statsSheet.getRow(1);
    groupRow.getCell(4).value = 'Wszystkie obserwowane oferty';
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
    statsSheet.getColumn(colIdx).width = 11;
    headerRow.getCell(colIdx++).value = 'Reserved';

    months.forEach(month => {
        groupRow.getCell(colIdx).value = `${CommConv.miesiac2str(month.idx + 1)} ${month.year}`;
        groupRow.getCell(colIdx).style.alignment = { horizontal: 'center' };
        statsSheet.mergeCells(`${groupRow.getCell(colIdx).address}:${groupRow.getCell(colIdx + 3).address}`);
        statsSheet.getColumn(colIdx).border = {
            left: { style: "thin", color: { argb: '000' } },
        };

        headerRow.getCell(colIdx++).value = 'New';
        headerRow.getCell(colIdx++).value = 'Free';
        headerRow.getCell(colIdx++).value = 'Sold';
        statsSheet.getColumn(colIdx).width = 11;
        headerRow.getCell(colIdx++).value = 'Reserved';
    });

    headerRow.eachCell(cell => cell.style.font = { bold: true });
}

type TMonth = { idx: number, year: number };
type TMonths = TMonth[];

function calculateMonths(from: Date, to: Date) {
    const result: TMonths = [];

    let month = from.getMonth();
    let year = from.getFullYear();

    result.push({ idx: month, year });

    while (year < to.getFullYear() || month < to.getMonth()) {
        if (++month >= 12) {
            month = 0;
            year++;
        }
        result.push({ idx: month, year });
    }

    return result;
}

const buildRows = (statsSheet: Excel.Worksheet, months: TMonths, stanList: IOfertaRecord[]) => {
    const inwestycje = Object.entries(inwestycjeMap).sort((a, b) => a[0].localeCompare(b[0]));

    const dataRowIdx = 3;
    let rowIdx = dataRowIdx;

    for (const [_, inwestycja] of inwestycje) {
        if (inwestycja === undefined) {
            continue;
        }
        // new line
        const row = statsSheet.getRow(rowIdx++);
        row.values = [''];
        row.border = { bottom: { style: 'thin' }, top: { style: 'thin' } };
        row.fill = { type: 'pattern', pattern: 'gray125', fgColor: {} };

        const oferty = stanList
            .filter(o => o.inwestycjaId === inwestycja.inwestycjaId);

        buildRow(statsSheet.getRow(rowIdx++), inwestycja, months, RowFilter.ALL, oferty)
        buildRow(statsSheet.getRow(rowIdx++), inwestycja, months, RowFilter.ROOMS_2, oferty);
        buildRow(statsSheet.getRow(rowIdx++), inwestycja, months, RowFilter.ROOMS_3, oferty);
        buildRow(statsSheet.getRow(rowIdx++), inwestycja, months, RowFilter.ROOMS_4, oferty)

    }
}

function buildRow(row: Excel.Row, inwestycja: IDataProvider, months: TMonths, filter: RowFilter, oferty: IOfertaRecord[]) {

    let colIdx = 1;
    row.getCell(colIdx++).value = inwestycja.inwestycjaId;
    row.getCell(colIdx++).value = inwestycja.lokalizacja;
    row.getCell(colIdx++).value = RowFilterLabelConv[filter];

    const ofertyByFilter = filter === RowFilter.ALL
        ? oferty
        : oferty.filter(o => typeof o.data.lpPokoj === 'number' && o.data.lpPokoj === filter);

    // grupa Wszystkie obserwowane oferty
    [null, Status.WOLNE, Status.SPRZEDANE, Status.REZERWACJA]
        .forEach(status => {
            const cell = row.getCell(colIdx++);
            cell.value = cellValue(ofertyByFilter, ofertaByStatusFilter(status));
            cellStyle(cell, status || 'nowy');
        });

    // usuwamy oferty, których sprzedaz nastapila przed pierwszym parsowaniem inwestycji 
    const ofertyByFilter2 = ofertyByFilter
        .filter(o => !(o.data.status === Status.SPRZEDANE
            && Utils.isSameDay(o.created_at, o.data.sprzedaneData)));

    // z podzialem na miesiace
    months.forEach(month => {
        const cell = row.getCell(colIdx++);
        cell.value = cellValue(ofertyByFilter2, ofertaNoweByMonth(month));
        cellStyle(cell, 'nowy');

        [Status.WOLNE, Status.SPRZEDANE, Status.REZERWACJA]
            .forEach(status => {
                const cell = row.getCell(colIdx++);
                cell.value = cellValue(ofertyByFilter2, ofertaByStatusAndMonthFilter(status, month));
                cellStyle(cell, status);
            });
    });

    return row;
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

function getNextMonth(month: TMonth): TMonth {
    return {
        idx: month.idx === 11 ? 0 : month.idx + 1,
        year: month.idx === 11 ? month.year + 1 : month.year
    };
}

function ofertaByStatusFilter(status: Status | null) {
    return (oferta: IOfertaRecord) => status === null || oferta.data.status === status;
}

function ofertaNoweByMonth(month: TMonth) {
    const monthTimestamp = new Date(month.year, month.idx).getTime();
    const monthPlus1Timestamp = new Date(
        month.idx === 11 ? month.year + 1 : month.year,
        month.idx === 11 ? 0 : month.idx + 1
    ).getTime();

    return (oferta: IOfertaRecord) => oferta.created_at >= monthTimestamp && oferta.created_at < monthPlus1Timestamp;
}

function ofertaByStatusAndMonthFilter(status: Status, month: TMonth) {
    const monthTimestamp = new Date(month.year, month.idx).getTime();
    const monthPlus1Timestamp = new Date(
        month.idx === 11 ? month.year + 1 : month.year,
        month.idx === 11 ? 0 : month.idx + 1
    ).getTime();

    return (oferta: IOfertaRecord) => {
        if (status === Status.WOLNE) {
            return oferta.created_at < monthPlus1Timestamp
                && (oferta.data.status === Status.WOLNE
                    || (oferta.data.sprzedaneData !== undefined
                        && oferta.data.sprzedaneData >= monthPlus1Timestamp));
        }
        else {
            return oferta.created_at < monthPlus1Timestamp
                && oferta.data.status === status
                && oferta.data.sprzedaneData !== undefined
                && oferta.data.sprzedaneData >= monthTimestamp
                && oferta.data.sprzedaneData < monthPlus1Timestamp;
        }
    }

}

function cellValue(list: IOfertaRecord[], filterFn: (o: IOfertaRecord) => boolean) {
    const result = list.filter(filterFn).length;

    return result > 0 ? result : '';
}

function cellStyle(cell: Excel.Cell, status: Status | null | 'nowy') {
    if (!cell.value || status === null) {
        return;
    }

    const argb = status === 'nowy'
        ? ExcelUtils.colors.navy
        : status === Status.WOLNE
            ? ExcelUtils.colors.darkGreen
            : status === Status.REZERWACJA
                ? ExcelUtils.colors.darkYellow
                : ExcelUtils.colors.darkRed;

    cell.style.font = { color: { argb }, bold: true };
    cell.style.alignment = { horizontal: 'center' }
}