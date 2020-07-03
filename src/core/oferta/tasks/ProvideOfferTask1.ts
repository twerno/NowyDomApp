import WebDownloader from "../../../utils/WebDownloader";
import { IAsyncTask } from "../../asyncTask/IAsyncTask";
import TaskHelper from '../../asyncTask/TaskHelper';
import { IDataProvider, IListElement } from "../IOfertaProvider";
import { IProvideOfferStats } from "./AbstractZapiszZmianyTask";
import { IEnv } from "./IEnv";
import { OfertaUpdateService } from "./OfertaUpdateService";
import ProvideOfferTask2 from "./ProvideOfferTask2";
import ProviderOfferHelper from "./ProviderOfferHelper";

export interface IProvideOfferTaskProps {
    executionDate: Date;
    stats: IProvideOfferStats;
    env: IEnv,
    updateService: OfertaUpdateService;
}

/**
 * Task buduje listę ofert ze strony i dla każdej oferty nadziewa kolejny task
 */
class ProvideOfferTask1<T extends IListElement = IListElement, D = any> implements IAsyncTask<IProvideOfferTaskProps> {

    public constructor(
        public readonly dataProvider: IDataProvider<T, D>,
        public readonly priority?: number) {
    }

    public async run(errors: any[], props: IProvideOfferTaskProps) {
        const url = this.dataProvider.getListUrl();

        const data = await this.downloadLists(url, errors);
        await this.saveHtml(data, props);

        const parseResult = this.parseOfferList(data, errors);

        const task2List = parseResult
            ? parseResult.items.map(offer =>
                new ProvideOfferTask2(offer, url, this.dataProvider, (this.priority || 0) + 1))
            : [];

        return [...task2List, ...(parseResult?.tasks || [])];
    }

    private async downloadLists(url: string, errors: any[]) {
        const promise = WebDownloader.download(url)
            .catch(TaskHelper.silentErrorReporter(errors, { method: 'downloadLists', url }))
            .then(html => ({ html, url }))

        return promise;
    }

    // przetworzenie pobranych stron i wyciągnięcie z nich listy ofert
    private parseOfferList(data: { html: string | null, url: string }, errors: any[]) {
        return data.html
            ? this.dataProvider.parseListHtml(data.html, errors, { dataProvider: this.dataProvider, priority: this.priority })
            : null;
    }

    private async saveHtml(data: { html: string | null, url: string }, props: IProvideOfferTaskProps) {
        // TODO - jesli kiedys dodam odtwarzenie zmian na podstawie zapisanego html, to trzeba pominac ten krok w otworzonym przebiegu
        return ProviderOfferHelper.saveHtml(data, `html/${props.executionDate.getTime()}`, props.env.fileService);
    }

}

export default ProvideOfferTask1;

