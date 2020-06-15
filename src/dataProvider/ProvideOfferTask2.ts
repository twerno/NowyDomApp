import { IAsyncTask } from "../utils/asyncTask/IAsyncTask";
import { IDataProvider, IListElement } from "./IOfertaProvider";
import WebDownloader from "../utils/WebDownloader";
import TaskHelper from './TaskHelper';
import TypeUtils from "../utils/TypeUtils";
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

        return new ProvideOfferTask3(oferta.id, oferta.dane, this.dataProvider, this.priority);
    }

    private async downloadDetails(errors: any[]) {
        const urls = Array.from(this.dataProvider.getOfferUrl(this.offer))
            .filter(TypeUtils.notEmpty);

        if (!urls || urls.length === 0) {
            return [];
        }

        const promises = urls.map(url => WebDownloader.download(url)
            .catch(TaskHelper.silentErrorReporter(errors, { method: 'downloadDetails', url }))
        )


        return Promise.all(promises);
    }

    private async parseDetails(htmlList: Array<string | null>, errors: any[]): Promise<D | undefined> {

        const promises = htmlList
            .filter(TypeUtils.notEmpty)
            .map(html => this.dataProvider.parseOfferHtml(html)
                .catch(TaskHelper.silentErrorReporter(errors, { method: 'parseDetails', html, offer: this.offer }))
            );

        const detailParts = await Promise.all(promises)
            .then(list => list.filter(TypeUtils.notEmpty));

        if (detailParts.length > 1) {
            const detailPartReducer = this.dataProvider.offerReducer;
            if (detailPartReducer === undefined) {
                TaskHelper.silentErrorReporter(errors, { method: 'parseDetail', offer: this.offer })('wiele wyników do zmergowania, ale nie zdefiniowano mergera!');
                return detailParts[0];
            } else {
                const detail = detailParts.reduce(detailPartReducer, {} as D);
                return detail;
            }
        }

        return detailParts[0];
    }

    // przepisanie lokalnych danych na obiekt
    private buildOffer(
        detail: D | undefined,
        errors: any[]
    ) {
        return this.dataProvider.offerBuilder(this.offer, detail);
    }

}

export default ProvideOfferTask2;

