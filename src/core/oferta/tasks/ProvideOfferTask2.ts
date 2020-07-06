import TypeUtils from "../../../utils/TypeUtils";
import WebDownloader from "../../../utils/WebDownloader";
import { IAsyncTask } from "../../asyncTask/IAsyncTask";
import TaskHelper from '../../asyncTask/TaskHelper';
import { IDataProvider, IListElement } from "../IOfertaProvider";
import ProvideOfferTask3 from "./ProvideOfferTask3";
import { IProvideOfferTaskProps } from "./ProvideOfferTask1";
import ProviderOfferHelper from "./ProviderOfferHelper";

/**
 * Pobieranie detali oferty, przygotowanie ofert znormalizowanej IOfertaDane
 * i nadzienie kolejnego tasku
 */
class ProvideOfferTask2<T extends IListElement = IListElement, D = any> implements IAsyncTask<IProvideOfferTaskProps> {

    public constructor(
        private offer: T,
        private parentUrl: string,
        private readonly dataProvider: IDataProvider<T, D>,
        public readonly priority?: number) {
    }

    public async run(errors: any[], props: IProvideOfferTaskProps) {
        const dataList = await this.downloadDetails(errors);
        await this.saveHtml(dataList, props)
        const detail = await this.parseDetails(dataList, errors);

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

        const promises = urls.map(url =>
            WebDownloader.download(url)
                .catch(TaskHelper.silentErrorReporter(errors, { method: 'downloadDetails', url }))
                .then(html => ({ url, html }))
        );

        return Promise.all(promises);
    }

    private async parseDetails(htmlList: Array<{ url: string, html: string | null }>, errors: any[]): Promise<D | null> {
        const htmls = htmlList.map(v => v.html).filter(TypeUtils.notEmpty);

        if (htmls.length === 0 || this.dataProvider.parseOfferHtml === null) {
            return null;
        }

        return this.dataProvider
            .parseOfferHtml(
                htmls.length === 1 ? htmls[0] : htmls,
                errors,
                this.offer.id,
                { dataProvider: this.dataProvider }
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

    private async saveHtml(dataList: Array<{ html: string | null, url: string }>, props: IProvideOfferTaskProps) {
        // TODO - jesli kiedys dodam odtwarzenie zmian na podstawie zapisanego html, to trzeba pominac ten krok w otworzonym przebiegu
        const path = `html/${props.executionDate.getTime()}/${ProviderOfferHelper.safeUrl(this.parentUrl)}`;
        const promises = dataList
            .map(data =>
                ProviderOfferHelper.saveHtml(data, path, props.env.fileService)
            );

        return Promise.all(promises);
    }

}

export default ProvideOfferTask2;

