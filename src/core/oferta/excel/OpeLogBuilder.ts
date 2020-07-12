import { IStringMap } from '@src/utils/IMap';
import { IOfertaRecord, IOfertaRecordOpe, IRawData, isRawData } from '../model/IOfertaModel';
import { Status, StatusHelper } from '../model/Status';

interface IOpeRecordLog {
    ofertaId: string,
    inwestycjaId: string,

    logList: {
        version: number,
        timestamp: number,
        status?: Status | IRawData;
        cena?: number | IRawData;
    }[]
}

interface IRichText {
    text: string,
    font?: { bold?: boolean }
}

interface IOpeLog {
    ofertaId: string,
    timestamp: number,
    richMessage: IRichText[],
    inwestycjaId: string,
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
        .filter(o => o.data.status !== undefined || o.data.cena !== undefined || o.updatedBy === 'developer')
        .forEach(reductor);

    return map;
}

// const inwestycjaObserwowanaOd: IStringMap<number> = {};
// stanList
//     .forEach(r => {
//         const prevDate = inwestycjaObserwowanaOd[r.inwestycjaId];
//         if (prevDate === undefined || prevDate > r.created_at) {
//             inwestycjaObserwowanaOd[r.inwestycjaId] = r.created_at;
//         }
//     });

export function buildOpeLogList(opeRecordLogMap: IStringMap<IOpeRecordLog>): IOpeLog[] {
    const result: IOpeLog[] = [];
    const minDate = new Date(2020, 6, 12).getTime();

    for (const rec of Object.values(opeRecordLogMap)) {
        let prevStatus: Status | IRawData | undefined = undefined;
        let prevCena: number | IRawData | undefined = undefined;
        for (const l of rec.logList) {

            let messagePart: IRichText[] = [];
            const cena: number | IRawData | undefined = l.cena;
            const status: Status | IRawData | undefined = l.status;
            if (l.version === 1) {
                messagePart.push(
                    { text: `Nowa pozycja, status: ` },
                    { text: `${StatusHelper.status2string(l.status)}`, font: { bold: true } }
                );
                prevCena = cena;
                prevStatus = status;
            } else {
                if (prevCena !== cena && cena !== undefined && !isRawData(cena) && prevCena !== undefined) {
                    messagePart.push(
                        { text: `cena była: ` },
                        { text: `${cenaFormater(prevCena)}`, font: { bold: true } },
                        { text: ` --> ` },
                        { text: `${cenaFormater(cena)}`, font: { bold: true } }
                    );
                    prevCena = cena;
                }

                if (prevStatus !== status && status !== undefined && !isRawData(status) && prevStatus !== undefined) {
                    messagePart.push(
                        { text: `status był: ` },
                        { text: `${StatusHelper.status2string(prevStatus)}`, font: { bold: true } },
                        { text: ` --> ` },
                        { text: `${StatusHelper.status2string(status)}`, font: { bold: true } }
                    );
                    prevStatus = status;
                }

            }

            if (messagePart.length > 0 && l.timestamp >= minDate) {
                result.push({
                    ofertaId: rec.ofertaId,
                    inwestycjaId: rec.inwestycjaId,
                    timestamp: l.timestamp,
                    richMessage: messagePart
                });
            }
        }
    }

    return result;
}

function cenaFormater(cena: number | IRawData | undefined): string {
    if (!isRawData(cena) && cena !== undefined) {
        return Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(cena);
    }
    return '';
}