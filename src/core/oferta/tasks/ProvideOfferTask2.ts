import TypeUtils from "../../../utils/TypeUtils";
import WebDownloader from "../../../utils/WebDownloader";
import { IAsyncTask } from "../../asyncTask/IAsyncTask";
import TaskHelper from '../../asyncTask/TaskHelper';
import { IDataProvider, IListElement } from "../IOfertaProvider";
import ProvideOfferTask3 from "./ProvideOfferTask3";

/**
 * Pobieranie detali oferty, przygotowanie ofert znormalizowanej IOfertaDane
 * i nadzienie kolejnego tasku
 */
class ProvideOfferTask2<T extends IListElement = IListElement, D = any> implements IAsyncTask {

    public constructor(
        private offer: T,
        private readonly dataProvider: IDataProvider<T, D>,
        public readonly priority?: number) {
    }

    public async run(errors: any[]) {
        const htmlList = await this.downloadDetails(errors);

        const detail = await this.parseDetails(htmlList, errors);

        const oferta = this.buildOffer(detail, errors);

        return new ProvideOfferTask3(oferta.id, oferta.dane, this.dataProvider, (this.priority || 0) + 1);
    }

    private async downloadDetails(errors: any[]) {
        const rawUrls = this.dataProvider.getOfferUrl(this.offer);

        if (!rawUrls) {
            return [];
        }

        const urls = typeof rawUrls === 'string'
            ? [rawUrls]
            : Array.from(new Set(rawUrls.filter(TypeUtils.notEmpty)));

        if (!urls || urls.length === 0) {
            return [];
        }

        const promises = urls.map(url => WebDownloader.download(url)
            .catch(TaskHelper.silentErrorReporter(errors, { method: 'downloadDetails', url }))
        )

        return Promise.all(promises);
    }

    private async parseDetails(htmlList: Array<string | null>, errors: any[]): Promise<D | null> {
        const htmls = htmlList.filter(TypeUtils.notEmpty);

        if (htmls.length === 0 || this.dataProvider.parseOfferHtml === null) {
            return null;
        }

        return this.dataProvider
            .parseOfferHtml(
                htmls.length === 1 ? htmls[0] : htmls,
                errors
            )
            .catch(TaskHelper.silentErrorReporter(errors, { method: 'parseDetails', htmlList, offer: this.offer }));
    }

    // przepisanie lokalnych danych na obiekt
    private buildOffer(
        detail: D | null,
        errors: any[]
    ) {
        return this.dataProvider.offerBuilder(this.offer, detail);
    }

}

export default ProvideOfferTask2;

