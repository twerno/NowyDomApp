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
    await test(workbook);

    await workbook.xlsx.writeFile('test.xlsx');
    console.log('done');
}

async function writeOfertaStanSheet(sheet: Excel.Worksheet) {
    const stanList = await ofertaRepo.scan();

    sheet.views = [
        { state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A1' }
    ];

    sheet.columns = [
        header('Inwestycja'),
        header('Developer'),
        header('Dodana dnia'),
        header('Status'),
        header('Budynek'),
        header('Mieszkanie'),
        header('Metraż'),
        header('Cena'),
        header('Liczba kondygnacji'),
        header('Liczba pokoi'),
        header('Odbiór'),
        header('Piętro'),
        header('Typ'),
        header('Strony świata'),
    ];

    const statusCol = sheet.getColumn('Status');

    sheet.addConditionalFormatting({
        ref: `${statusCol.letter}2:${statusCol.letter}${stanList.length + 1}`,
        rules: [
            {
                type: 'containsText',
                operator: 'containsText',
                text: 'wolne',
                style: { fill: solidBgPattern('FF00FF00'), alignment: { horizontal: 'right' } },
                priority: 1
            },
            {
                type: 'containsText',
                operator: 'containsText',
                text: 'Sprzedane',
                style: { fill: solidBgPattern('FF000000') },
                priority: 2
            }
        ]
    })

    //console.log(JSON.stringify(stanList.map(v => valOrRaw2Str(v.data.cena))));
    sheet.getColumn('Cena').numFmt = '# ##0,00 [$PLN];-# ##0,00 [$PLN]';
    sheet.getColumn('Liczba kondygnacji').numFmt = '';

    stanList.forEach(v =>
        sheet.addRow(
            {
                'Inwestycja': v.inwestycjaId,
                'Developer': v.developerId,
                'Dodana dnia': new Date(v.created_at),
                'Status': StatusHelper.status2string(v.data.status),
                'Budynek': valOrRaw2Str(v.data.budynek),
                'Mieszkanie': valOrRaw2Str(v.data.nrLokalu),
                'Metraż': valOrRaw2Str(v.data.metraz),
                'Cena': cena2Excel(v.data.cena),
                'Liczba kondygnacji': v.data.liczbaKondygnacji,
                'Liczba pokoi': valOrRaw2Str(v.data.lpPokoj),
                'Odbiór': OdbiorTypeHelper.odbior2Str(v.data.odbior),
                'Piętro': valOrRaw2Str(v.data.pietro),
                'Typ': TypHelper.typ2str(v.data.typ),
                'Strony świata': v.data.stronySwiata?.map(StronaSwiataHelper.stronaSwiata2Short).join(', '),
                'test': ''
            }
        )
    );

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
        width: width || 20
    }
}

function cena2Excel(cena: number | IRawData | undefined | null): number | string | null {
    if (cena === null || cena === undefined) {
        return null;
    }

    if (isRawData(cena)) {
        return cena.raw || '';
    }

    return cena;

    // const result = cena.toString().replace(/\./g, ',');
    // return result;
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

async function test(workbook: Excel.Workbook) {
    const worksheet = workbook.addWorksheet('sheet', { properties: { tabColor: { argb: 'FF00FF00' } } });
    worksheet.columns = [
        { header: 'Id', key: 'id', width: 10 },
        { header: 'Name', key: 'name', width: 32 },
        { header: 'D.O.B.', key: 'DOB', width: 10, outlineLevel: 1 }
    ];


    const idCol = worksheet.getColumn('id');
    const nameCol = worksheet.getColumn('B');
    const dobCol = worksheet.getColumn(3);

    // set column properties

    // Note: will overwrite cell value C1
    dobCol.header = 'Date of Birth';

    // Note: this will overwrite cell values C1:C2
    dobCol.header = ['Date of Birth', 'A.K.A. D.O.B.', 'test'];

    // from this point on, this column will be indexed by 'dob' and not 'DOB'
    dobCol.key = 'dob';

    dobCol.width = 15;

    // Hide the column if you'd like
    dobCol.hidden = false;

    // set an outline level for columns
    // worksheet.getColumn(4).outlineLevel = 0;
    // worksheet.getColumn(5).outlineLevel = 1;
    // dobCol.outlineLevel = 10;

    worksheet.getColumn(6).values = [1, 2, 3, 4, 5];

    // add a sparse column of values
    worksheet.getColumn(7).values = [null, null, 2, 3, null, 5, null, 7, null, null, null, 11];

    // worksheet.spliceColumns(3, 2);

    // // remove one column and insert two more.
    // // Note: columns 4 and above will be shifted right by 1 column.
    // // Also: If the worksheet has more rows than values in the column inserts,
    // //  the rows will still be shifted as if the values existed
    // const newCol3Values = [1, 2, 3, 4, 5];
    // const newCol4Values = ['one', 'two', 'three', 'four', 'five'];
    // worksheet.spliceColumns(3, 1, newCol3Values, newCol4Values);
}