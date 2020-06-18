import { IAsyncTask } from "../utils/asyncTask/IAsyncTask";
import WebDownloader from "../utils/WebDownloader";
import { IDataProvider, IListElement } from "./IOfertaProvider";
import ProvideOfferTask2 from "./ProvideOfferTask2";
import TaskHelper from './TaskHelper';
import { IProvideOfferStats } from "./AbstractZapiszZmianyTask";



/**
 * Task buduje listę ofert ze strony i dla każdej oferty nadziewa kolejny task
 */
class ProvideOfferTask1<T extends IListElement = IListElement, D = any> implements IAsyncTask<IProvideOfferStats> {

    public constructor(
        public readonly dataProvider: IDataProvider<T, D>,
        public readonly priority?: number) {
    }

    public async run(errors: any[], stats: IProvideOfferStats) {
        const url = this.dataProvider.getListUrl();

        const listHtml = await this.downloadLists(url, errors);

        const parseResult = this.parseOfferList(listHtml, errors);

        const task2List = parseResult
            ? parseResult.items.map(offer =>
                new ProvideOfferTask2(offer, this.dataProvider, (this.priority || 0) + 1))
            : [];

        return [...task2List, ...(parseResult?.tasks || [])];
    }

    private async downloadLists(url: string, errors: any[]) {
        const promise = WebDownloader.download(url)
            .catch(TaskHelper.silentErrorReporter(errors, { method: 'downloadLists', url }));

        return promise;
    }

    // przetworzenie pobranych stron i wyciągnięcie z nich listy ofert
    private parseOfferList(html: string | null, errors: any[]) {
        return html
            ? this.dataProvider.parseListHtml(html, errors, { dataProvider: this.dataProvider, priority: this.priority })
            : null;
    }

}

export default ProvideOfferTask1;

