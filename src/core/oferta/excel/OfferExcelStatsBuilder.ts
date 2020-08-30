import CommConv from '@src/core/utils/CommConv';
import { inwestycjeMap } from '@src/inwestycje/inwestycje';
import Excel from 'exceljs';
import { IDataProvider } from '../IOfertaProvider';
import { IOfertaRecord } from '../model/IOfertaModel';
import { Status } from '../model/Status';
import ExcelUtils, { IAddNextCellOptions } from './ExcelUtils';
import Utils from '@src/utils/Utils';
import TypeUtils from '@src/utils/TypeUtils';

const startMonth = new Date('06.01.2020');

export const OfferExcelStatsBuilder = (statsSheet: Excel.Worksheet, stanList: IOfertaRecord[]) => {

    statsSheet.views = [
        { state: 'frozen', ySplit: 2, xSplit: 3, activeCell: 'A1' }
    ];

    const months = internalUtils.calculateMonthsBetween(startMonth, new Date());

    buildHeader(statsSheet, months);
    buildRows(statsSheet, months, stanList);
}

const buildHeader = (statsSheet: Excel.Worksheet, months: TMonths) => {
    const groupRow = statsSheet.getRow(1);
    const addHeaderGroup = (label: string, colStart: number, groupLength: number) => {
        // cell
        const cell = groupRow.getCell(colStart);
        cell.value = label;
        cell.style.alignment = { horizontal: 'center' };

        // merge
        const A = statsSheet.getColumn(colStart).letter;
        const B = statsSheet.getColumn(colStart + groupLength).letter;
        statsSheet.mergeCells(`${A}1:${B}1`);

        // border
        statsSheet.getColumn(colStart + groupLength).border = {
            right: { style: 'thin' }
        };
    };

    const headerRow = statsSheet.getRow(2);
    const addHeader = (label: string, options?: IAddNextCellOptions) => {
        return ExcelUtils.addNextCell(headerRow, label, { bold: true, ...options });
    };

    addHeaderGroup('Wszystkie obserwowane oferty', 4, 3);

    addHeader('Inwestycja', { width: 20 });
    addHeader('Lokalizacja', { width: 16 });
    addHeader('Filtr', { width: 12 });
    addHeader('All');
    addHeader('Free');
    addHeader('Sold');
    addHeader('Reserved', { width: 11 });

    months.forEach(month => {
        const groupLabel = `${CommConv.miesiac2str(month.idx + 1)} ${month.year}`;
        addHeaderGroup(groupLabel, headerRow.actualCellCount + 1, 3);

        addHeader('New');
        addHeader('Free');
        addHeader('Sold');
        addHeader('Reserved', { width: 11 });
    });

}

const buildRows = (statsSheet: Excel.Worksheet, months: TMonths, stanList: IOfertaRecord[]) => {

    const inwestycje = Object.values(inwestycjeMap)
        .filter(TypeUtils.notEmpty)
        .sort((a, b) => a.inwestycjaId.localeCompare(b.inwestycjaId));

    for (const inwestycja of inwestycje) {

        const oferty = stanList
            .filter(o => o.inwestycjaId === inwestycja.inwestycjaId);

        ExcelUtils.emptyLine(statsSheet);
        buildRow(ExcelUtils.getNextRow(statsSheet), inwestycja, months, RowFilter.ALL, oferty)
        buildRow(ExcelUtils.getNextRow(statsSheet), inwestycja, months, RowFilter.ROOMS_2, oferty);
        buildRow(ExcelUtils.getNextRow(statsSheet), inwestycja, months, RowFilter.ROOMS_3, oferty);
        buildRow(ExcelUtils.getNextRow(statsSheet), inwestycja, months, RowFilter.ROOMS_4, oferty)
    }
}

function buildRow(row: Excel.Row, inwestycja: IDataProvider, months: TMonths, filter: RowFilter, oferty: IOfertaRecord[]) {

    // filtrujemy wg liczby pomieszczen
    const ofertyByLpPokoj = oferty.filter(filterByPokoje(filter));

    const nextCell = (list: IOfertaRecord[], filterFn: (o: IOfertaRecord) => boolean, status: Status | null) => {
        const cell = ExcelUtils.addNextCell(row, internalUtils.cellValue(list, filterFn));
        cell.style = { ...cell.style, ...internalUtils.buildStyleFor(status) };
    }

    // row header
    ExcelUtils.addNextCell(row, inwestycja.inwestycjaId);
    ExcelUtils.addNextCell(row, inwestycja.miasto);
    ExcelUtils.addNextCell(row, RowFilterLabelConv[filter]);
    nextCell(ofertyByLpPokoj, ofertaByStatusFilter(null), null);
    nextCell(ofertyByLpPokoj, ofertaByStatusFilter(Status.WOLNE), Status.WOLNE);
    nextCell(ofertyByLpPokoj, ofertaByStatusFilter(Status.SPRZEDANE), Status.SPRZEDANE);
    nextCell(ofertyByLpPokoj, ofertaByStatusFilter(Status.REZERWACJA), Status.REZERWACJA);


    // usuwamy oferty, których sprzedaz nastapila przed pierwszym parsowaniem inwestycji 
    const ofertyByFilter = ofertyByLpPokoj
        .filter(notSoldInAPast);

    months.forEach(month => {
        nextCell(ofertyByFilter, ofertaNoweByMonth(month), null);
        nextCell(ofertyByFilter, ofertaByStatusAndMonthFilter(Status.WOLNE, month), Status.WOLNE);
        nextCell(ofertyByFilter, ofertaByStatusAndMonthFilter(Status.SPRZEDANE, month), Status.SPRZEDANE);
        nextCell(ofertyByFilter, ofertaByStatusAndMonthFilter(Status.REZERWACJA, month), Status.REZERWACJA);
    });

    return row;
}

// FILTERS

enum RowFilter {
    ALL = '',
    ROOMS_2 = 2,
    ROOMS_3 = 3,
    ROOMS_4 = 4
}

const RowFilterLabelConv = {
    [RowFilter.ALL]: '',
    [RowFilter.ROOMS_2]: '2 lub mniej',
    [RowFilter.ROOMS_3]: '3-pokojowe',
    [RowFilter.ROOMS_4]: '4 lub więcej',
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

function filterByPokoje(filter: RowFilter) {
    return (o: IOfertaRecord) => {

        if (filter === RowFilter.ROOMS_2) {
            return typeof o.data.lpPokoj === 'number' && o.data.lpPokoj <= 2
        }
        else if (filter === RowFilter.ROOMS_3) {
            return o.data.lpPokoj === 3
        }
        else if (filter === RowFilter.ROOMS_4) {
            return typeof o.data.lpPokoj === 'number' && o.data.lpPokoj >= 4
        }

        // RowFilter.ALL
        return true;
    };
}

function notSoldInAPast(o: IOfertaRecord) {
    return !(o.data.status === Status.SPRZEDANE && Utils.isSameDay(o.created_at, o.data.sprzedaneData));
}


type TMonth = { idx: number, year: number };
type TMonths = TMonth[];

const internalUtils = {
    cellValue(list: IOfertaRecord[], filterFn: (o: IOfertaRecord) => boolean) {
        const result = list.filter(filterFn).length;

        return result > 0 ? result : '';
    },

    buildStyleFor(status: Status | null): Partial<Excel.Style> {
        const argb = status === null
            ? ExcelUtils.colors.navy
            : status === Status.WOLNE
                ? ExcelUtils.colors.darkGreen
                : status === Status.REZERWACJA
                    ? ExcelUtils.colors.darkYellow
                    : ExcelUtils.colors.darkRed;

        return {
            font: { color: { argb }, bold: true },
            alignment: { horizontal: 'center' },
        }
    },

    calculateMonthsBetween(from: Date, to: Date) {
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
    },
}