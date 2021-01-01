import { IStringMap } from '@src/core/utils/IMap';
import { IOfertaRecord, IOfertaRecordOpe } from '../oferta/model/IOfertaModel';
import { Status, StatusHelper } from '../oferta/model/Status';
import { inwestycjeMap } from '@src/inwestycje/inwestycje';
import Utils from '@src/core/utils/Utils';
import ExcelUtils from './ExcelUtils';
import { IRawData, isRawData } from '../oferta/model/IRawData';

interface IOpeRecordLogListEl {
    version: number,
    timestamp: number,
    status?: Status | IRawData;
    cena?: number | IRawData;
}

interface IOpeRecordLog {
    ofertaId: string,
    inwestycjaId: string,

    logList: IOpeRecordLogListEl[]
}

interface IRichText {
    text: string,
    font?: { bold?: boolean, color?: { 'argb'?: string } },
}

export interface IOpeLog {
    ofertaId: string,
    timestamp: number,
    richMessage: IRichText[],
    inwestycjaId: string,
    version: number,
    stan: IOfertaRecord | undefined,
    typ: 'oferta' | 'grupa'
}

export function buildOpeRecordLogMap(stanList: IOfertaRecord[], opeList: IOfertaRecordOpe[]): IStringMap<IOpeRecordLog> {

    const map: IStringMap<IOpeRecordLog> = {};

    const reductor = (ope: IOfertaRecordOpe) => {
        let log = map[ope.ofertaId];
        if (log === undefined) {
            log = {
                ofertaId: ope.ofertaId,
                inwestycjaId: stanList.find(s => s.ofertaId === ope.ofertaId)?.inwestycjaId || '',
                logList: []
            };
            map[ope.ofertaId] = log;
        }

        log.logList.push({
            timestamp: ope.timestamp,
            version: ope.version,
            cena: ope.data.cena,
            status: ope.data.status
        });
    }

    opeList
        .filter(o => o.data.status !== undefined || o.data.cena !== undefined)
        .filter(o => o.updatedBy === 'developer')
        .forEach(reductor);

    return map;
}

const colorOK = ExcelUtils.colors.darkGreen;
const colorWARN = ExcelUtils.colors.darkRed;
type nowaInwestycjaGroupType = IStringMap<{ list: Array<IOpeRecordLogListEl & { ofertaId: string }>, stan?: IOfertaRecord }>;

export function buildOpeLogList(stanList: IOfertaRecord[], opeRecordLogMap: IStringMap<IOpeRecordLog>): IOpeLog[] {
    const result: IOpeLog[] = [];

    const inwestycjaMinDateMap = minDateOfInwestycja(stanList);
    const nowaInwestycjaGroup: nowaInwestycjaGroupType = {};

    for (const rec of Object.values(opeRecordLogMap)) {
        if (rec === undefined) {
            continue;
        }
        let prevStatus: Status | IRawData | undefined = undefined;
        let prevCena: number | IRawData | undefined = undefined;

        const stan = stanList.find(v => v.ofertaId === rec.ofertaId);

        for (const l of rec.logList) {
            let messagePart: IRichText[] = [];
            const cena: number | IRawData | undefined = l.cena;
            const status: Status | IRawData | undefined = l.status;

            const inwestycjaMinDate = inwestycjaMinDateMap[rec.inwestycjaId];

            if (Utils.isSameDay(inwestycjaMinDate, l.timestamp)) {
                const { list } = nowaInwestycjaGroup[rec.inwestycjaId] || { list: [] };
                list.push({ ...l, ofertaId: rec.ofertaId });
                nowaInwestycjaGroup[rec.inwestycjaId] = { list, stan };
            } else if (l.version === 1 && status !== Status.SPRZEDANE) {
                const color = { argb: status === Status.WOLNE ? colorOK : colorWARN };
                messagePart.push(
                    { text: `Nowa pozycja, status: ` },
                    { text: `${StatusHelper.status2string(l.status)}`, font: { bold: true, color } }
                );
            } else {
                if (prevCena !== cena && typeof cena === 'number' && typeof prevCena === 'number') {
                    const color = { argb: cena > prevCena ? colorWARN : colorOK };
                    messagePart.push(
                        { text: `Cena: ` },
                        { text: `${cenaFormater(prevCena)}`, font: { bold: true } },
                        { text: ` --> ` },
                        { text: `${cenaFormater(cena)}`, font: { bold: true, color } },
                        { text: `;  ${cenaFormater(cena - prevCena)}` }
                    );
                }

                if (prevStatus !== status && status !== undefined && !isRawData(status) && prevStatus !== undefined) {
                    const color = { argb: status === Status.WOLNE ? colorOK : colorWARN };
                    const cenaSprzedazy = status === Status.SPRZEDANE
                        ? stanList.find(s => s.ofertaId === rec.ofertaId)?.data.cena
                        : undefined;

                    messagePart.push(
                        { text: `Status: ` },
                        { text: `${StatusHelper.status2string(prevStatus)}`, font: { bold: true } },
                        { text: ` --> ` },
                        { text: `${StatusHelper.status2string(status)}`, font: { bold: true, color } },
                        { text: cenaSprzedazy ? ` (${cenaFormater(cenaSprzedazy)})` : '' }
                    );
                }
            }

            prevCena = cena ?? prevCena;
            prevStatus = status ?? prevStatus;

            if (messagePart.length > 0) {
                result.push({
                    ofertaId: rec.ofertaId,
                    inwestycjaId: rec.inwestycjaId,
                    timestamp: l.timestamp,
                    richMessage: messagePart,
                    version: l.version,
                    stan,
                    typ: 'oferta'
                });
            }
        }
    }

    const noweInwestycjeMsgList = nowaInwestycjaGroup2Msg(nowaInwestycjaGroup);

    return [...result, ...noweInwestycjeMsgList];
}

function cenaFormater(cena: number | IRawData | undefined): string {
    if (typeof cena === 'number') {
        return Intl.NumberFormat('pl-PL', {
            style: 'currency',
            currency: 'PLN',
            maximumFractionDigits: 0,
            minimumFractionDigits: 0,
            currencyDisplay: 'name'
        })
            .format(cena);
    }
    return '';
}

function minDateOfInwestycja(stanList: IOfertaRecord[]) {
    const inwestycjaObserwowanaOd: IStringMap<number> = {};
    stanList
        .forEach(r => {
            const prevDate = inwestycjaObserwowanaOd[r.inwestycjaId];
            if (prevDate === undefined || prevDate > r.created_at) {
                inwestycjaObserwowanaOd[r.inwestycjaId] = r.created_at;
            }
        });
    return inwestycjaObserwowanaOd;
}



function nowaInwestycjaGroup2Msg(nowaInwestycjaGroup: nowaInwestycjaGroupType) {

    const result: IOpeLog[] = [];

    for (const inwestycjaId in nowaInwestycjaGroup) {
        const map: IStringMap<Status | IRawData> = {};

        nowaInwestycjaGroup[inwestycjaId]?.list
            .forEach(l => {
                if (l.status !== undefined) {
                    map[l.ofertaId] = l.status;
                }
            });

        const timestamp = nowaInwestycjaGroup[inwestycjaId]?.list[0].timestamp;
        const statusy = podliczStatusy(map);

        const message: IRichText[] = [
            { text: `Nowa inwestycja` },
            { text: ` "${inwestycjaId}"`, font: { bold: true } },
            { text: ` wolnych: ` },
            { text: `${statusy[Status.WOLNE]}`, font: { bold: true } },
            { text: ` , zarezerwowanych: ` },
            { text: `${statusy[Status.REZERWACJA]}`, font: { bold: true } },
            { text: ` , sprzedanych: ` },
            { text: `${statusy[Status.SPRZEDANE]}`, font: { bold: true } },
        ];
        if (statusy.IRawData > 0) {
            message.push(
                { text: ` , nie udało się odczytać statusów ` },
                { text: `${statusy.IRawData}`, font: { bold: true } },
                { text: ` ofert` },
            )
        }

        const stan = nowaInwestycjaGroup[inwestycjaId]?.stan;

        if (timestamp !== undefined) {
            result.push({
                inwestycjaId,
                ofertaId: '',
                timestamp,
                richMessage: message,
                version: -1,
                stan,
                typ: 'grupa'
            });
        }
    }

    return result;
}

interface IPodliczStatusyResult {
    [Status.REZERWACJA]: number,
    [Status.SPRZEDANE]: number,
    [Status.WOLNE]: number,
    'IRawData': number
}

function podliczStatusy(map: IStringMap<Status | IRawData>) {
    const result = {
        [Status.REZERWACJA]: 0,
        [Status.SPRZEDANE]: 0,
        [Status.WOLNE]: 0,
        'IRawData': 0
    };

    Object.values(map)
        .forEach(s => {
            if (s === Status.REZERWACJA) {
                result[Status.REZERWACJA]++;
            } else if (s === Status.SPRZEDANE) {
                result[Status.SPRZEDANE]++;
            } else if (s === Status.WOLNE) {
                result[Status.WOLNE]++;
            } else {
                result.IRawData++;
            }
        })
    return result;
}

export const opeLogSort = (a: IOpeLog, b: IOpeLog) => {
    const sortKeyA = sortDateKey(a);
    const sortKeyB = sortDateKey(b);

    const developerA = inwestycjeMap[a.inwestycjaId]?.developerId || '';
    const developerB = inwestycjeMap[b.inwestycjaId]?.developerId || '';

    return sortKeyB.localeCompare(sortKeyA)
        || developerA.localeCompare(developerB)
        || a.ofertaId.localeCompare(b.ofertaId)
        || a.version - b.version;
}

function sortDateKey(a: IOpeLog) {
    const dateA = new Date(a.timestamp);
    return `${dateA.getFullYear()}-${dateA.getMonth().toString().padStart(2, '0')}-${dateA.getDate().toString().padStart(2, '0')}`
}