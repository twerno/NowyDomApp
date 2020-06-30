import { IAsyncTask } from "../../asyncTask/IAsyncTask";
import { IDataProvider, IListElement } from "../IOfertaProvider";
import { IOfertaDane, IOfertaRecord } from "../model/IOfertaModel";
import { OfertaUpdateHelper } from "./OfertaUpdateService";
import { IProvideOfferTaskProps } from "./ProvideOfferTask1";
import { IStringMap } from "../../../utils/IMap";

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
    totalErrors: number,
    total: number;
    unchanged: number,
    added: number;
    updated: number;
    deleted: number;

    byInwestycja: IStringMap<
        {
            errors: any[],
            total: number;
            unchanged: number,
            added: number;
            updated: number;
            deleted: number;
        }
    >;
}

export function add2Summary(
    dataProvider: IDataProvider<any, any>,
    stats: IProvideOfferStats,
    errors: any[],
    summary?: IIProvideOfferSummary
): IIProvideOfferSummary {
    const result: IIProvideOfferSummary =
        summary
        || {
            totalErrors: 0,
            total: 0,
            unchanged: 0,
            added: 0,
            updated: 0,
            deleted: 0,
            byInwestycja: {}
        };

    result.totalErrors += errors.length;
    result.total += stats.total;
    result.unchanged += stats.unchanged;
    result.added += stats.added.count;
    result.updated += stats.updated.count;
    result.deleted += stats.deleted.count;

    result.byInwestycja[dataProvider.inwestycjaId] = {
        errors,
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

abstract class AbstractZapiszZmianyTask<T extends IListElement = IListElement, D = any> implements IAsyncTask<IProvideOfferTaskProps> {

    public constructor(
        protected readonly dataProvider: IDataProvider<T, D>) { }

    abstract run(errors: any[], props: IProvideOfferTaskProps): Promise<IAsyncTask | IAsyncTask[]>;

    protected async wyliczZmianyIZapisz(
        ofertaId: string,
        offerData: IOfertaDane | null,
        errors: any[],
        props: IProvideOfferTaskProps,
        fixedStan?: IOfertaRecord
    ) {
        const stan = fixedStan || await this.pobierzStan(ofertaId, props) || null;

        const zmiana = OfertaUpdateHelper.wyliczZmiane({ id: ofertaId, data: offerData }, stan, this.dataProvider, props.stats);
        return zmiana;
    }

    protected async pobierzStan(ofertaId: string, props: IProvideOfferTaskProps) {
        const key = {
            inwestycjaId: this.dataProvider.inwestycjaId,
            ofertaId: ofertaId
        };
        return props.env.stanService.getOne(key)
    }
}

export default AbstractZapiszZmianyTask;

