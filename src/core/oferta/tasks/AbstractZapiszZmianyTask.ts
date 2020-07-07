import { IAsyncTask } from "../../asyncTask/IAsyncTask";
import { IDataProvider, IListElement } from "../IOfertaProvider";
import { IOfertaDane, IOfertaRecord } from "../model/IOfertaModel";
import { OfertaUpdateHelper, IOfertaWyliczonaZmina } from "./OfertaUpdateService";
import { IProvideOfferTaskProps } from "./ProvideOfferTask1";
import { IStringMap } from "../../../utils/IMap";
import { defaultDateService } from "../service/IDateService";

export interface IProvideOfferStats {
    totalRecords: Set<string>,
    unchanged: Set<string>,

    added: {
        count: Set<string>,
        records: Array<{ id: string } & IOfertaDane>
    },
    updated: {
        count: Set<string>,
        records: Array<{ id: string } & Partial<IOfertaDane>>
    },
    deleted: {
        count: Set<string>,
        records: { id: string }[]
    },
    resourcesDownloaded: {
        count: Set<string>
    }
};

export interface IIProvideOfferSummary {
    totalErrors: number,
    totalRecords: number;
    unchanged: number,
    added: number;
    updated: number;
    deleted: number;
    resourcesDownloaded: number;

    byInwestycja: IStringMap<
        {
            errors: any[],
            totalRecords: number;
            unchanged: number,
            added: number;
            updated: number;
            deleted: number;
            resourcesDownloaded: number;
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
            byInwestycja: {},
            totalErrors: 0,
            totalRecords: 0,
            unchanged: 0,
            added: 0,
            updated: 0,
            deleted: 0,
            resourcesDownloaded: 0,
        };

    result.totalErrors += errors.length;
    result.totalRecords += stats.totalRecords.size;
    result.unchanged += stats.unchanged.size;
    result.added += stats.added.count.size;
    result.updated += stats.updated.count.size;
    result.deleted += stats.deleted.count.size;
    result.resourcesDownloaded += stats.resourcesDownloaded.count.size;

    result.byInwestycja[dataProvider.inwestycjaId] = {
        errors,
        totalRecords: stats.totalRecords.size,
        unchanged: stats.unchanged.size,
        added: stats.added.count.size,
        updated: stats.updated.count.size,
        deleted: stats.deleted.count.size,
        resourcesDownloaded: stats.resourcesDownloaded.count.size,
    };

    return result;
}

export const getEmptyProvideOfferStats = (): IProvideOfferStats => (
    {
        totalRecords: new Set<string>(),
        unchanged: new Set<string>(),
        added: { count: new Set<string>(), records: [] },
        updated: { count: new Set<string>(), records: [] },
        deleted: { count: new Set<string>(), records: [] },
        resourcesDownloaded: { count: new Set<string>() },
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

        const zmiana = OfertaUpdateHelper.wyliczZmiane(
            { id: ofertaId, data: offerData }, stan, this.dataProvider, props.stats, defaultDateService);

        await this.zapisz(zmiana, props);

        return zmiana;
    }

    protected async pobierzStan(ofertaId: string, props: IProvideOfferTaskProps) {
        const key = {
            inwestycjaId: this.dataProvider.inwestycjaId,
            ofertaId: ofertaId
        };
        return props.env.stanService.getOne(key)
    }

    protected async zapisz(zmiany: IOfertaWyliczonaZmina | null, props: IProvideOfferTaskProps) {
        if (zmiany) {
            await props.env.stanService.save(zmiany.rekord);
            await props.env.opeService.save(zmiany.ope);
        }

    }
}

export default AbstractZapiszZmianyTask;

