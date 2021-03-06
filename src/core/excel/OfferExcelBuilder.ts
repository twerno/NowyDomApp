import { inwestycjeMap } from '@src/inwestycje/inwestycje';
import Excel from 'exceljs';
import { IOfertaRecord } from '../oferta/model/IOfertaModel';
import { OdbiorTypeHelper } from '../oferta/model/OdbiorType';
import { StatusHelper } from '../oferta/model/Status';
import { StronaSwiataHelper } from '../oferta/model/StronySwiata';
import { TypHelper } from '../oferta/model/Typ';
import { IEnv } from '../oferta/tasks/IEnv';
import ExcelUtils from './ExcelUtils';
import { buildOpeLogList, buildOpeRecordLogMap, opeLogSort } from './OpeLogBuilder';
import { buildStatsSheet } from './OfferExcelStatsBuilder';
import moment from 'moment-timezone';
import { IStringMap } from '@src/core/utils/IMap';

export async function buildExcel(env: IEnv) {

    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet('Stan');
    const zmianySheet = workbook.addWorksheet('Zmiany');
    const statsSheet = workbook.addWorksheet('Statystyki');

    const stanList = (await env.stanService.getAll())
    // .filter(v => {
    //     const inwestycja = inwestycjeMap[v.inwestycjaId];

    //     return inwestycja?.miasto === 'Reda'
    //         || (inwestycja?.miasto === 'Rumia' && inwestycja?.dzielnica === 'Biała Rzeka')
    //         || (inwestycja?.miasto === 'Rumia' && inwestycja?.dzielnica === 'Janowo');
    // });

    await buildStanSheet(sheet, stanList);
    await buildZmianaSheet(zmianySheet, stanList, env);
    buildStatsSheet(statsSheet, stanList);

    console.log('plik raport.xlsx został wygenerowany');

    return workbook.xlsx.writeBuffer();
}

async function buildStanSheet(sheet: Excel.Worksheet, stanList: IOfertaRecord[]) {

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
            const inwestycja = inwestycjeMap[v.inwestycjaId];
            const sprzedane = v.data.sprzedaneData
                ? moment(v.data.sprzedaneData).tz('Poland').format('YYYY-MM-DD')
                : undefined

            const row = sheet.addRow(
                {
                    'Inwestycja': ExcelUtils.cellUrl(v.inwestycjaId, inwestycja?.url),
                    'Lokal': ExcelUtils.cellUrl(v.ofertaId.replace(`${v.inwestycjaId}-`, ''), v.data.offerDetailsUrl),
                    'Dodane': moment(v.created_at).tz('Poland').format('YYYY-MM-DD'),
                    'Sprzedane': sprzedane,
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

async function buildZmianaSheet(sheet: Excel.Worksheet, stanList: IOfertaRecord[], env: IEnv) {

    const ofertyMap = stanList.reduce<IStringMap>((map, curr) => ({ ...map, [curr.ofertaId]: '' }), {});

    const opeList = (await env.opeService.getAll())
        .filter(v => ofertyMap[v.ofertaId] === '');

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
            'Kiedy': moment(v.timestamp).tz('Poland').format('YYYY-MM-DD'),
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
