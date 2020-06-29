import { IStringMap } from "../../../utils/IMap";
import TypeUtils from "../../../utils/TypeUtils";
import { IDataProvider } from "../IOfertaProvider";
import { IOfertaDane, IOfertaRecord, IOfertaRecordOpe } from "../model/IOfertaModel";
import { Status } from "../model/Status";
import { IProvideOfferStats } from "./AbstractZapiszZmianyTask";

interface IOfertaStateService {
    load(inwestycja: string): Promise<IOfertaRecord[]>,
    save(record: IOfertaRecord): Promise<any>
}

interface IOfertaOpeService {
    save(record: IOfertaRecordOpe): Promise<any>
}

export class OfertaUpdateService {

    public readonly cache: IStringMap<IOfertaRecord> = {};

    public constructor(
        protected readonly dataProvider: IDataProvider<any, any>,
        protected readonly stanService: IOfertaStateService,
        protected readonly opeService: IOfertaOpeService,
        protected readonly stats: IProvideOfferStats,
    ) {

    }

    public async buildCache() {
        const oferty = await this.stanService.load(this.dataProvider.inwestycjaId)
        oferty.forEach(oferta => this.cache[oferta.ofertaId] = oferta);
    }

    public async wyliczIZapiszZmiane(oferta: { id: string, data: IOfertaDane | null }) {
        const stan = this.cache[oferta.id] || null;
        const zmiana = OfertaUpdateHelper.wyliczZmiane(oferta, stan, this.dataProvider, this.stats);
        if (zmiana) {
            await this.zapiszZmiany(zmiana);
        }

        // wyliczony rekord - usuwamy z cache
        delete this.cache[oferta.id];

        return zmiana;
    }

    protected async zapiszZmiany(zmiany: IOfertaWyliczonaZmina) {
        await this.opeService.save(zmiany.ope);
        await this.stanService.save(zmiany.rekord);
    }

    public async wyliczIZapiszUsuniete() {
        // po wyliczeniu wszystkich aktualizacji to co zostało w cache traktujemy jako usuniete
        for (const id in this.cache) {
            await this.wyliczIZapiszZmiane({ id, data: null });
        }
    }

}

export enum ZmianaType { NEW, UPDATE, DELETE };
export interface IOfertaWyliczonaZmina { rekord: IOfertaRecord, ope: IOfertaRecordOpe, type: ZmianaType };

export const OfertaUpdateHelper = {

    wyliczZmiane: function (
        oferta: { id: string, data: IOfertaDane | null },
        stan: IOfertaRecord | null,
        dataProvider: IDataProvider<any, any>,
        stats: IProvideOfferStats
    ): IOfertaWyliczonaZmina | null {
        const data = oferta.data;

        if (!stan) {

            if (!data) {
                this.updateStats(null, stats);
                return null;
            }

            const result = InternalOfertaUpdateHelper.nowyRekord(oferta.id, data, dataProvider);
            this.updateStats(result, stats);
            return result;
        }

        // usunięty
        if (!data) {
            const result = InternalOfertaUpdateHelper.usunietyRekord(stan);
            this.updateStats(result, stats);
            return result;
        }

        // wylicz zmiane
        const result = InternalOfertaUpdateHelper.zmienionyRekord(stan, data);
        this.updateStats(result, stats);
        return result;
    },

    updateStats(zmiana: IOfertaWyliczonaZmina | null, stats: IProvideOfferStats) {
        stats.total++;

        if (zmiana?.type === ZmianaType.NEW) {
            stats.added.count++;
            stats.added.records.push({ ...zmiana.rekord.data, id: zmiana.rekord.ofertaId });
        }
        else if (zmiana?.type === ZmianaType.UPDATE) {
            stats.updated.count++;
            stats.updated.records.push({ id: zmiana.rekord.ofertaId, ...zmiana?.ope.data });
        }
        else if (zmiana?.type === ZmianaType.DELETE) {
            stats.deleted.count++;
            stats.deleted.records.push({ id: zmiana.rekord.ofertaId });
        } else {
            stats.unchanged++;
        }
    }

}

const InternalOfertaUpdateHelper = {

    nowyRekord: function (
        ofertaId: string,
        offerData: IOfertaDane,
        dataProvider: IDataProvider<any, any>
    ): IOfertaWyliczonaZmina {
        const timestamp = new Date().getTime();

        const rekord: IOfertaRecord = {
            inwestycjaId: dataProvider.inwestycjaId, // partition_key
            ofertaId: ofertaId, // sort_key
            developerId: dataProvider.developerId,
            version: 1,
            created_at: timestamp,
            updated_at: timestamp,
            data: offerData,
        };

        const ope: IOfertaRecordOpe = {
            ofertaId: ofertaId,  // partition_key
            version: 1, // sort_key
            timestamp,
            data: offerData,
            updatedBy: 'developer'
        };

        return { rekord, ope, type: ZmianaType.NEW };
    },

    usunietyRekord: function (stan: IOfertaRecord): IOfertaWyliczonaZmina | null {
        const timestamp = new Date().getTime();

        if (stan.data.status === Status.SPRZEDANE) {
            return null;
        }

        const rekord: IOfertaRecord = {
            ...stan,
            version: stan.version + 1,
            data: {
                ...stan.data,
                status: Status.SPRZEDANE
            }
        };

        const ope: IOfertaRecordOpe = {
            ofertaId: stan.ofertaId,  // partition_key
            version: stan.version + 1, // sort_key
            timestamp,
            data: { status: Status.SPRZEDANE },
            updatedBy: 'developer'
        }

        return { rekord, ope, type: ZmianaType.DELETE };
    },

    zmienionyRekord: function (stan: IOfertaRecord, oferta: IOfertaDane): IOfertaWyliczonaZmina | null {
        const timestamp = new Date().getTime();

        const delta = this.wyliczDelta(stan, oferta);

        if (delta === null) {
            return null;
        }

        const rekord: IOfertaRecord = {
            ...stan,
            version: stan.version + 1,
            data: {
                ...stan.data,
                ...delta
            }
        };

        const ope: IOfertaRecordOpe = {
            ofertaId: stan.ofertaId,  // partition_key
            version: stan.version + 1, // sort_key
            timestamp,
            data: delta,
            updatedBy: 'developer'
        }

        return { rekord, ope, type: ZmianaType.UPDATE };

    },

    wyliczDelta: function <T extends IOfertaDane, S extends { data: T }>(stan: S, oferta: T) {
        const result: Partial<T> = {};
        let hasChange = false;

        for (const key in oferta) {
            if (oferta[key] instanceof Object) {
                if (!TypeUtils.deepEqual(oferta[key], stan.data[key])) {
                    result[key] = oferta[key];
                    hasChange = true;
                }
            } else {
                if (oferta[key] !== stan.data[key]) {
                    result[key] = oferta[key];
                    hasChange = true;
                }
            }
        }

        return hasChange ? result : null;
    },
}