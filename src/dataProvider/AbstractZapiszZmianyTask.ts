import { ofertaOpeRepo } from "../db/OfertaRecordOpeRepo";
import { ofertaRepo } from "../db/OfertaRecordRepo";
import { IAsyncTask } from "../utils/asyncTask/IAsyncTask";
import TypeUtils from "../utils/TypeUtils";
import { IDataProvider, IListElement } from "./IOfertaProvider";
import { IOfertaDane, IOfertaRecord, IOfertaRecordOpe, Status } from "./IOfertaRecord";
import { IStringMap } from "utils/IMap";

export interface IProvideOfferStats {
    total: number,
    unchanged: number,

    added: {
        count: number,
        records: Array<{ id: string } & IOfertaDane>
    },
    updated: {
        count: number,
        records: Array<{ id: string } & Partial<IOfertaDane>>
    },
    deleted: {
        count: number,
        records: { id: string }[]
    },
};

export interface IIProvideOfferSummary {
    total: number;
    unchanged: number,
    added: number;
    updated: number;
    deleted: number;

    byInwestycja: IStringMap<
        {
            total: number;
            unchanged: number,
            added: number;
            updated: number;
            deleted: number;
        }
    >;
}

export function add2Summary(dataProvider: IDataProvider<any, any>, stats: IProvideOfferStats, summary?: IIProvideOfferSummary): IIProvideOfferSummary {
    const result: IIProvideOfferSummary =
        summary
        || {
            total: 0,
            added: 0,
            deleted: 0,
            unchanged: 0,
            updated: 0,
            byInwestycja: {}
        };

    result.total += stats.total;
    result.unchanged += stats.unchanged;
    result.added += stats.added.count;
    result.updated += stats.updated.count;
    result.deleted += stats.deleted.count;

    result.byInwestycja[dataProvider.inwestycjaId] = {
        total: stats.total,
        unchanged: stats.unchanged,
        added: stats.added.count,
        updated: stats.updated.count,
        deleted: stats.deleted.count,
    };

    return result;
}

export const getEmptyProvideOfferStats = (): IProvideOfferStats => (
    {
        total: 0,
        unchanged: 0,
        added: { count: 0, records: [] },
        updated: { count: 0, records: [] },
        deleted: { count: 0, records: [] },
    }
);

abstract class AbstractZapiszZmianyTask<T extends IListElement = IListElement, D = any> implements IAsyncTask<IProvideOfferStats> {

    public constructor(
        protected readonly dataProvider: IDataProvider<T, D>) { }

    abstract run(errors: any[], stats: IProvideOfferStats): Promise<IAsyncTask | IAsyncTask[]>;

    protected async wyliczZmianyIZapisz(
        ofertaId: string,
        offerData: IOfertaDane | null,
        errors: any[],
        stats: IProvideOfferStats,
        fixedStan?: IOfertaRecord
    ) {
        const stan = fixedStan || await this.pobierzStan(ofertaId);

        stats.total++;

        const zmiana = this.wyliczZmiane(ofertaId, offerData, stan, stats);

        if (zmiana) {
            this.zapiszZmiany(zmiana);
        }
        else {
            stats.unchanged++;
        }

        return zmiana;
    }

    protected async pobierzStan(ofertaId: string) {
        return ofertaRepo.get({
            inwestycjaId: this.dataProvider.inwestycjaId,
            ofertaId: ofertaId
        });
    }

    private wyliczZmiane(
        ofertaId: string,
        offerData: IOfertaDane | null,
        stan: IOfertaRecord | undefined,
        stats: IProvideOfferStats
    ): { rekord: IOfertaRecord, ope: IOfertaRecordOpe } | null {

        if (!stan) {
            return !offerData
                ? null
                : this.nowyRekord(ofertaId, offerData, stats)
        }

        // usunięty
        if (!offerData) {
            return this.usunietyRekord(stan, stats);
        }

        // wylicz zmiane
        return this.zmienionyRekord(stan, offerData, stats);
    }

    protected async zapiszZmiany(zmiany: { rekord: IOfertaRecord, ope: IOfertaRecordOpe }) {
        await ofertaOpeRepo.put(zmiany.ope);
        return ofertaRepo.put(zmiany.rekord);
    }

    private nowyRekord(
        ofertaId: string,
        offerData: IOfertaDane,
        stats: IProvideOfferStats
    ): { rekord: IOfertaRecord, ope: IOfertaRecordOpe } {
        const timestamp = new Date().getTime();

        stats.added.count++;
        stats.added.records.push({ ...offerData, id: ofertaId });

        const rekord: IOfertaRecord = {
            inwestycjaId: this.dataProvider.inwestycjaId, // partition_key
            ofertaId: ofertaId, // sort_key
            developerId: this.dataProvider.developerId,
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

        return { rekord, ope };
    }

    private usunietyRekord(
        stan: IOfertaRecord,
        stats: IProvideOfferStats
    ): { rekord: IOfertaRecord, ope: IOfertaRecordOpe } {
        const timestamp = new Date().getTime();

        const rekord: IOfertaRecord = {
            ...stan,
            version: stan.version + 1,
            data: {
                ...stan.data,
                status: Status.USUNIETA
            }
        };

        stats.deleted.count++;
        stats.deleted.records.push({ id: stan.ofertaId });

        const ope: IOfertaRecordOpe = {
            ofertaId: stan.ofertaId,  // partition_key
            version: stan.version + 1, // sort_key
            timestamp,
            data: { status: Status.USUNIETA },
            updatedBy: 'developer'
        }

        return { rekord, ope };
    }

    private zmienionyRekord(
        stan: IOfertaRecord,
        oferta: IOfertaDane,
        stats: IProvideOfferStats
    ): { rekord: IOfertaRecord, ope: IOfertaRecordOpe } | null {
        const timestamp = new Date().getTime();

        const delta = this.wyliczDelta(stan, oferta);

        if (delta === null) {
            return null;
        }

        stats.updated.count++;
        stats.updated.records.push({ id: stan.ofertaId, ...delta });

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

        return { rekord, ope };

    }
    private wyliczDelta<T extends IOfertaDane, S extends { data: T }>(stan: S, oferta: T) {
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
    }
}

export default AbstractZapiszZmianyTask;

