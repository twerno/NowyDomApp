import { ofertaOpeRepo } from "../db/OfertaRecordOpeRepo";
import { ofertaRepo } from "../db/OfertaRecordRepo";
import { IAsyncTask } from "../utils/asyncTask/IAsyncTask";
import TypeUtils from "../utils/TypeUtils";
import { IDataProvider, IListElement } from "./IOfertaProvider";
import { IOfertaDane, IOfertaRecord, IOfertaRecordOpe, Status } from "./IOfertaRecord";

abstract class AbstractZapiszZmianyTask<T extends IListElement = IListElement, D = any> implements IAsyncTask {

    public constructor(protected readonly dataProvider: IDataProvider<T, D>) { }

    abstract run(errors: any[]): Promise<IAsyncTask | IAsyncTask[]>;

    protected async wyliczZmianyIZapisz(ofertaId: string, offerData: IOfertaDane | null, errors: any[], fixedStan?: IOfertaRecord) {
        const stan = fixedStan || await this.pobierzStan(ofertaId);

        const zmiana = this.wyliczZmiane(ofertaId, offerData, stan);

        if (zmiana) {
            this.zapiszZmiany(zmiana);
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
        stan: IOfertaRecord | null): { rekord: IOfertaRecord, ope: IOfertaRecordOpe } | null {

        if (stan === null) {
            return offerData === null
                ? null
                : this.nowyRekord(ofertaId, offerData)
        }

        // usunięty
        if (offerData === null) {
            return this.usunietyRekord(stan);
        }

        // wylicz zmiane
        return this.zmienionyRekord(stan, offerData);
    }

    protected async zapiszZmiany(zmiany: { rekord: IOfertaRecord, ope: IOfertaRecordOpe }) {
        await ofertaOpeRepo.put(zmiany.ope);
        return ofertaRepo.put(zmiany.rekord);
    }

    private nowyRekord(ofertaId: string, offerData: IOfertaDane): { rekord: IOfertaRecord, ope: IOfertaRecordOpe } {
        const timestamp = new Date().getTime();

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
        stan: IOfertaRecord
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
    ): { rekord: IOfertaRecord, ope: IOfertaRecordOpe } | null {
        const timestamp = new Date().getTime();

        // zmienna "zasoby pobrane" nie jest czascia oferty - nadpisujemy ja wersja ze stanu, zeby nie generowac falszywych zmian
        const safeOferta = { ...oferta, zasobyPobrane: stan.data.zasobyPobrane };

        const delta = this.wyliczDelta(stan, safeOferta);

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

