import { IStringMap } from "../../../utils/IMap";
import TypeUtils from "../../../utils/TypeUtils";
import { IDataProvider } from "../IOfertaProvider";
import { IOfertaDane, IOfertaRecord, IOfertaRecordOpe, IRawData, isRawData } from "../model/IOfertaModel";
import { Status, StatusHelper } from "../model/Status";
import { IProvideOfferStats } from "./AbstractZapiszZmianyTask";
import { IEnv } from "./IEnv";
import { IDateService, defaultDateService } from "../service/IDateService";

export class OfertaUpdateService {

    public readonly cache: IStringMap<IOfertaRecord> = {};

    public constructor(
        protected readonly dataProvider: IDataProvider<any, any>,
        protected readonly env: IEnv,
        protected readonly stats: IProvideOfferStats,
    ) {

    }

    public async buildCache() {
        const oferty = await this.env.stanService.getByInwestycja(this.dataProvider.inwestycjaId)
        oferty.forEach(oferta => this.cache[oferta.ofertaId] = oferta);
    }

    public async wyliczIZapiszZmiane(oferta: { id: string, data: IOfertaDane | null }) {
        const stan = this.cache[oferta.id] || null;
        const zmiana = OfertaUpdateHelper.wyliczZmiane(oferta, stan, this.dataProvider, this.stats, defaultDateService);
        if (zmiana) {
            await this.zapiszZmiany(zmiana);
        }

        // wyliczony rekord - usuwamy z cache
        delete this.cache[oferta.id];

        return zmiana;
    }

    protected async zapiszZmiany(zmiany: IOfertaWyliczonaZmina) {
        await this.env.opeService.save(zmiany.ope);
        await this.env.stanService.save(zmiany.rekord);
    }

    public async wyliczIZapiszUsuniete() {
        // po wyliczeniu wszystkich aktualizacji to co zostało w cache traktujemy jako usuniete
        for (const id in this.cache) {
            await this.wyliczIZapiszZmiane({ id, data: null });
        }
    }

    public usunByInwestycja(inwestycjaId: string) {
        for (const [key, val] of Object.entries(this.cache)) {
            if (val?.inwestycjaId === inwestycjaId) {
                delete this.cache[key];
            }
        }
    }

    public usunByOferta(ofertaId: string) {
        delete this.cache[ofertaId];
    }

}

export enum ZmianaType { NEW, UPDATE, DELETE };
export interface IOfertaWyliczonaZmina { rekord: IOfertaRecord, ope: IOfertaRecordOpe, type: ZmianaType };

export const OfertaUpdateHelper = {

    wyliczZmiane: function (
        oferta: { id: string, data: IOfertaDane | null },
        stan: IOfertaRecord | null,
        dataProvider: IDataProvider<any, any>,
        stats: IProvideOfferStats | null,
        dateService: IDateService,
    ): IOfertaWyliczonaZmina | null {
        const data = oferta.data;

        if (!stan) {

            if (!data) {
                this.updateStats(oferta.id, null, stats);
                return null;
            }

            const result = InternalOfertaUpdateHelper.nowyRekord(oferta.id, data, dataProvider, dateService);
            this.updateStats(oferta.id, result, stats);
            return result;
        }

        // usunięty
        if (!data) {
            const result = InternalOfertaUpdateHelper.oznaczSprzedane(stan, dateService);
            this.updateStats(oferta.id, result, stats);
            return result;
        }

        // wylicz zmiane
        const result = InternalOfertaUpdateHelper.zmienionyRekord(stan, data, dateService);
        this.updateStats(oferta.id, result, stats);
        return result;
    },

    updateStats(id: string, zmiana: IOfertaWyliczonaZmina | null, stats: IProvideOfferStats | null) {
        if (!stats) {
            return;
        }
        stats.totalRecords.add(id);

        if (zmiana?.type === ZmianaType.NEW) {
            stats.added.count.add(id);
            stats.added.records.push({ ...zmiana.rekord.data, id: zmiana.rekord.ofertaId });
        }
        else if (zmiana?.type === ZmianaType.UPDATE) {
            stats.updated.count.add(id);
            stats.updated.records.push({ id: zmiana.rekord.ofertaId, ...zmiana?.ope.data });
        }
        else if (zmiana?.type === ZmianaType.DELETE) {
            stats.deleted.count.add(id);
            stats.deleted.records.push({ id: zmiana.rekord.ofertaId });
        } else {
            stats.unchanged.add(id);
        }
    }

}

const InternalOfertaUpdateHelper = {

    nowyRekord: function (
        ofertaId: string,
        offerData: IOfertaDane,
        dataProvider: IDataProvider<any, any>,
        dateService: IDateService,
    ): IOfertaWyliczonaZmina {
        const timestamp = dateService.now().getTime();

        const data = { ...offerData };
        if (data.status === Status.SPRZEDANE || data.status === Status.REZERWACJA) {
            data.sprzedaneData = timestamp;
        }

        const rekord: IOfertaRecord = {
            inwestycjaId: dataProvider.inwestycjaId, // partition_key
            ofertaId: ofertaId, // sort_key
            developerId: dataProvider.developerId,
            version: 1,
            created_at: timestamp,
            updated_at: timestamp,
            data,
        };

        const ope: IOfertaRecordOpe = {
            ofertaId: ofertaId,  // partition_key
            version: 1, // sort_key
            timestamp,
            data,
            updatedBy: 'developer'
        };

        return { rekord, ope, type: ZmianaType.NEW };
    },

    oznaczSprzedane: function (stan: IOfertaRecord, dateService: IDateService): IOfertaWyliczonaZmina | null {
        const timestamp = dateService.now().getTime();

        if (stan.data.status === Status.SPRZEDANE) {
            return null;
        }

        const rekord: IOfertaRecord = {
            ...stan,
            version: stan.version + 1,
            data: {
                ...stan.data,
                status: Status.SPRZEDANE,
                sprzedaneData: timestamp,
            }
        };

        const ope: IOfertaRecordOpe = {
            ofertaId: stan.ofertaId,  // partition_key
            version: stan.version + 1, // sort_key
            timestamp,
            data: {
                status: Status.SPRZEDANE,
                sprzedaneData: timestamp,
            },
            updatedBy: 'developer'
        }

        return { rekord, ope, type: ZmianaType.DELETE };
    },

    zmienionyRekord: function (stan: IOfertaRecord, oferta: IOfertaDane, dateService: IDateService): IOfertaWyliczonaZmina | null {
        const timestamp = dateService.now().getTime();
        let delta: Partial<IOfertaDane> | null = null;

        // nie rejestrujemy zmian na niekatywnych ofertach (innych niż zmiana statusu i pobieranie plików)
        // na niektorych stronach z ofert nieaktywnych usuwane sa niektore dane np. cena
        if (StatusHelper.isStatusAktywny(oferta.status)
            || (stan?.data.zasobyPobrane?.length || 0) < oferta.zasobyDoPobrania.length) {
            delta = this.wyliczDelta(stan, oferta);
        }
        else if (stan.data.status === oferta.status) {
            return null;
        }
        else if (oferta.status === Status.REZERWACJA) {
            delta = {
                status: Status.REZERWACJA,
                sprzedaneData: timestamp
            };
        }
        else if (oferta.status === Status.SPRZEDANE) {
            return this.oznaczSprzedane(stan, dateService);
        }

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