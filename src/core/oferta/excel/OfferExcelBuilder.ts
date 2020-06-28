import Excel from 'exceljs';
import { ofertaRepo } from '../repo/OfertaRecordRepo';
import { IRawData, isRawData } from '../model/IOfertaModel';
import { StronaSwiataHelper } from '../model/StronySwiata';
import { StatusHelper } from '../model/Status';
import { OdbiorTypeHelper } from '../model/OdbiorType';
import { TypHelper } from '../model/Typ';

export async function buildExcel() {

    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet('Stan');

    await writeOfertaStanSheet(sheet);
    // await test(workbook);

    await workbook.xlsx.writeFile('test.xlsx');
    console.log('done');
}

async function writeOfertaStanSheet(sheet: Excel.Worksheet) {
    const stanList = await ofertaRepo.scan();

    sheet.views = [
        { state: 'frozen', xSplit: 3, ySplit: 1, activeCell: 'A1' }
    ];

    sheet.columns = [
        header('Inwestycja', 15),
        header('Budynek', 10),
        header('Mieszkanie', 10),
        header('Status'),
        header('Developer'),
        header('Dodana dnia'),
        header('Metraż'),
        header('Cena'),
        header('Cena za metr'),
        header('Liczba kondygnacji'),
        header('Liczba pokoi'),
        header('Odbiór'),
        header('Piętro'),
        header('Typ'),
        header('Strony świata'),
    ];

    setColStyle(sheet, stanList);

    stanList.forEach(v => {
        const row = sheet.addRow(
            {
                'Inwestycja': v.inwestycjaId,
                'Budynek': valOrRaw2Str(v.data.budynek),
                'Mieszkanie': valOrRaw2Str(v.data.nrLokalu),
                'Developer': v.developerId,
                'Dodana dnia': new Date(v.created_at),
                'Status': StatusHelper.status2string(v.data.status),
                'Metraż': number2Excel(v.data.metraz),
                'Cena': number2Excel(v.data.cena),
                'Liczba kondygnacji': v.data.liczbaKondygnacji,
                'Liczba pokoi': valOrRaw2Str(v.data.lpPokoj),
                'Odbiór': OdbiorTypeHelper.odbior2Str(v.data.odbior),
                'Piętro': valOrRaw2Str(v.data.pietro),
                'Typ': TypHelper.typ2str(v.data.typ),
                'Strony świata': v.data.stronySwiata?.map(StronaSwiataHelper.stronaSwiata2Short).join(', '),

            }
        );

        const cellAdress = `${sheet.getColumn('Cena za metr').letter}${row.number}`;
        sheet.getCell(cellAdress).value =
        {
            formula: `=${sheet.getColumn('Cena').letter}${row.number}/${sheet.getColumn('Metraż').letter}${row.number}`,
            date1904: false
        };
    }

    );
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

    sheet.getColumn('Cena').numFmt = '# ##0.00 [$PLN];-# ##0.00 [$PLN]';
    sheet.getColumn('Liczba kondygnacji').numFmt = '';
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

function header(header: string, width?: number): Partial<Excel.Column> {
    return {
        header,
        key: header,
        width: width || 15
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

// async function test(workbook: Excel.Workbook) {
//     const worksheet = workbook.addWorksheet('sheet', { properties: { tabColor: { argb: 'FF00FF00' } } });
//     worksheet.columns = [
//         { header: 'Id', key: 'id', width: 10 },
//         { header: 'Name', key: 'name', width: 32 },
//         { header: 'D.O.B.', key: 'DOB', width: 10, outlineLevel: 1 }
//     ];


//     const idCol = worksheet.getColumn('id');
//     const nameCol = worksheet.getColumn('B');
//     const dobCol = worksheet.getColumn(3);

//     // set column properties

//     // Note: will overwrite cell value C1
//     dobCol.header = 'Date of Birth';

//     // Note: this will overwrite cell values C1:C2
//     dobCol.header = ['Date of Birth', 'A.K.A. D.O.B.', 'test'];

//     // from this point on, this column will be indexed by 'dob' and not 'DOB'
//     dobCol.key = 'dob';

//     dobCol.width = 15;

//     // Hide the column if you'd like
//     dobCol.hidden = false;

//     // set an outline level for columns
//     // worksheet.getColumn(4).outlineLevel = 0;
//     // worksheet.getColumn(5).outlineLevel = 1;
//     // dobCol.outlineLevel = 10;

//     worksheet.getColumn(6).values = [1, 2, 3, 4, 5];

//     // add a sparse column of values
//     worksheet.getColumn(7).values = [null, null, 2, 3, null, 5, null, 7, null, null, null, 11];

//     // worksheet.spliceColumns(3, 2);

//     // // remove one column and insert two more.
//     // // Note: columns 4 and above will be shifted right by 1 column.
//     // // Also: If the worksheet has more rows than values in the column inserts,
//     // //  the rows will still be shifted as if the values existed
//     // const newCol3Values = [1, 2, 3, 4, 5];
//     // const newCol4Values = ['one', 'two', 'three', 'four', 'five'];
//     // worksheet.spliceColumns(3, 1, newCol3Values, newCol4Values);
// }