import { IAsyncTask } from "../utils/asyncTask/IAsyncTask";
import { IDataProvider, IListElement } from "./IOfertaProvider";
import WebDownloader from "../utils/WebDownloader";
import TaskHelper from './TaskHelper';
import TypeUtils from "../utils/TypeUtils";
import ProvideOfferTask2 from "./ProvideOfferTask2";

class ProvideOfferTask1<T extends IListElement = IListElement, D = any> implements IAsyncTask {

    public constructor(
        private readonly dataProvider: IDataProvider<T, D>,
        public readonly priority?: number) {

    }

    public async run(errors: any[]): Promise<IAsyncTask[]> {
        const urls = await this.dataProvider.listUrlProvider();

        const listHtml = await this.downloadLists(urls, errors);

        console.log('pobieranie listy ofert');
        const offerList = this.parseOfferList(listHtml, errors);

        return offerList
            .map(offer => new ProvideOfferTask2(offer, this.dataProvider, this.priority));
    }

    private async downloadLists(urls: Set<string>, errors: any[]) {
        const promises: Promise<{ url: string, html: string } | null>[] = [];

        for (const url of urls) {
            promises.push(
                WebDownloader.download(url)
                    .then(html => ({ url, html }))
                    .catch(TaskHelper.silentErrorReporter(errors, { method: 'downloadLists', url }))
            );
        }

        return Promise.all(promises);
    }

    // przetworzenie pobranych stron i wyciągnięcie z nich listy ofert
    private parseOfferList(
        lista: Array<{ url: string, html: string } | null>,
        errors: any[]
    ) {
        return lista
            .filter(TypeUtils.notEmpty)
            .map(({ html }) => this.dataProvider.listHtmlParser(html))
            .reduce((prev, curr) => [...prev, ...curr], []);
    }

}

export default ProvideOfferTask1;

