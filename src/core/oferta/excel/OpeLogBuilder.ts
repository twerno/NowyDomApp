import { IStringMap } from '@src/utils/IMap';
import { IOfertaRecord, IOfertaRecordOpe, IRawData, isRawData } from '../model/IOfertaModel';
import { Status, StatusHelper } from '../model/Status';

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

interface IOpeLog {
    ofertaId: string,
    timestamp: number,
    richMessage: IRichText[],
    inwestycjaId: string,
    version: number,
}

export function buildOpeRecordLogMap(stanList: IOfertaRecord[], opeList: IOfertaRecordOpe[]): IStringMap<IOpeRecordLog> {

    const map: IStringMap<IOpeRecordLog> = {};

    const reductor = (ope: IOfertaRecordOpe) => {
        let log: IOpeRecordLog = map[ope.ofertaId];
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

const colorOK = '13ca21';
const colorWARN = 'E70812';


export function buildOpeLogList(stanList: IOfertaRecord[], opeRecordLogMap: IStringMap<IOpeRecordLog>): IOpeLog[] {
    const result: IOpeLog[] = [];

    const inwestycjaMinDateMap = minDateOfInwestycja(stanList);
    const nowaInwestycjaGroup: IStringMap<Array<IOpeRecordLogListEl & { ofertaId: string }>> = {};

    for (const rec of Object.values(opeRecordLogMap)) {
        let prevStatus: Status | IRawData | undefined = undefined;
        let prevCena: number | IRawData | undefined = undefined;

        for (const l of rec.logList) {

            let messagePart: IRichText[] = [];
            const cena: number | IRawData | undefined = l.cena;
            const status: Status | IRawData | undefined = l.status;

            const inwestycjaMinDate = inwestycjaMinDateMap[rec.inwestycjaId];

            if (isSameDay(inwestycjaMinDate, l.timestamp)) {
                const list = nowaInwestycjaGroup[rec.inwestycjaId] || [];
                list.push({ ...l, ofertaId: rec.ofertaId });
                nowaInwestycjaGroup[rec.inwestycjaId] = list;
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
                        { text: `${cenaFormater(cena)}`, font: { bold: true, color } }
                    );
                }

                if (prevStatus !== status && status !== undefined && !isRawData(status) && prevStatus !== undefined) {
                    const color = { argb: status === Status.WOLNE ? colorOK : colorWARN };
                    messagePart.push(
                        { text: `Status: ` },
                        { text: `${StatusHelper.status2string(prevStatus)}`, font: { bold: true } },
                        { text: ` --> ` },
                        { text: `${StatusHelper.status2string(status)}`, font: { bold: true, color } }
                    );
                }
            }

            prevCena = cena;
            prevStatus = status;

            if (messagePart.length > 0) {
                result.push({
                    ofertaId: rec.ofertaId,
                    inwestycjaId: rec.inwestycjaId,
                    timestamp: l.timestamp,
                    richMessage: messagePart,
                    version: l.version
                });
            }
        }
    }

    const noweInwestycjeMsgList = nowaInwestycjaGroup2Msg(nowaInwestycjaGroup);

    return [...result, ...noweInwestycjeMsgList];
}

function cenaFormater(cena: number | IRawData | undefined): string {
    if (typeof cena === 'number') {
        return Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0, minimumFractionDigits: 0 })
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

function isSameDay(timestamp1: number, timestamp2: number): boolean {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);

    return date1.getFullYear() === date2.getFullYear()
        && date1.getMonth() === date2.getMonth()
        && date1.getDate() === date2.getDate();
}

function nowaInwestycjaGroup2Msg(nowaInwestycjaGroup: IStringMap<Array<IOpeRecordLogListEl & { ofertaId: string }>>) {

    const result: IOpeLog[] = [];

    for (const inwestycjaId in nowaInwestycjaGroup) {
        const map: IStringMap<Status | IRawData> = {};

        nowaInwestycjaGroup[inwestycjaId]
            .forEach(l => {
                if (l.status !== undefined) {
                    map[l.ofertaId] = l.status;
                }
            });

        const timestamp = nowaInwestycjaGroup[inwestycjaId][0].timestamp;
        const statusy = podliczStatusy(map);

        const message: IRichText[] = [
            { text: `Nowa inwestycja` },
            { text: ` "${inwestycjaId}"`, font: { bold: true } },
            { text: `wolnych: ` },
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

        if (timestamp !== undefined) {
            result.push({
                inwestycjaId,
                ofertaId: '',
                timestamp,
                richMessage: message,
                version: -1
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

