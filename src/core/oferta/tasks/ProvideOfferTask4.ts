import Axios, { AxiosResponse } from "axios";
import { contentType, extension } from "mime-types";
import { IDataProvider, IListElement } from "../IOfertaProvider";
import { IOfertaRecord } from "../model/IOfertaModel";
import AbstractZapiszZmianyTask, { getEmptyProvideOfferStats } from "./AbstractZapiszZmianyTask";
import { IProvideOfferTaskProps } from "./ProvideOfferTask1";
import ProviderOfferHelper from "./ProviderOfferHelper";

/**
 * pobranie dodatkowych zasobów, odłożenie ich na s3 i aktualizacja bazy danych
 */
class ProvideOfferTask4<T extends IListElement = IListElement, D = any> extends AbstractZapiszZmianyTask<T, D> {

    public constructor(
        private ofertaId: string,
        private stan: IOfertaRecord | undefined,
        dataProvider: IDataProvider<T, D>,
        public readonly priority?: number) {
        super(dataProvider);
    }

    public async run(errors: any[], props: IProvideOfferTaskProps) {

        const stan = this.stan;

        if (stan) {
            const doPobrania = stan.data.zasobyDoPobrania
                .filter(z => !this.zasobPobrany(z, stan));

            let stanCached = stan;

            // const resourcesDownloaded = {count: new Set<string>()};
            // wywolywanie operacji synchroniczne
            for (const res of doPobrania) {
                const zmiana = await this.pobierzIZapisz(res, stanCached, errors, props);
                stanCached = zmiana?.rekord || stanCached;
            }
        }

        return [];
    }

    private zasobPobrany(zasob: { id: string }, stan: IOfertaRecord) {
        return !!stan.data.zasobyPobrane
            && !!stan.data.zasobyPobrane.find(z => z.id === zasob.id);
    }

    private async pobierzIZapisz(
        zasob: { id: string; url: string | string[] },
        stanCached: IOfertaRecord,
        errors: any[],
        props: IProvideOfferTaskProps
    ) {
        console.log('pobieranie', JSON.stringify(zasob), this.ofertaId);
        const s3Filename = await this.pobierzIZapiszNaS3(zasob, props);

        const stan = stanCached || await this.pobierzStan(this.ofertaId, props);
        const zmiana = { ...stan?.data, zasobyPobrane: [...stan?.data.zasobyPobrane || [], { id: zasob.id, s3Filename }] };
        const result = await this.wyliczZmianyIZapisz(this.ofertaId, zmiana, errors, { ...props, stats: getEmptyProvideOfferStats() }, stan);
        props.stats.resourcesDownloaded.count++;
        return result;

    }

    private async pobierzIZapiszNaS3(
        zasob: { id: string; url: string | string[] },
        props: IProvideOfferTaskProps
    ) {
        const urls = typeof zasob.url === 'string' ? [zasob.url] : zasob.url;
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            let file = null;

            // pobieramy po kolei wszystkie urle, jesli żadnego nie udało się pobrać rzucamy ostatni otrzymany błąd
            try {
                file = await Axios({ responseType: 'arraybuffer', url });
            } catch (err) {
                if (i + 1 === urls.length) {
                    throw err;
                }
                continue;
            }
            const fileExt = this.readFileExt(file);
            const filename = ProviderOfferHelper.safeFileName(
                `${this.ofertaId}_${zasob.id}` + (fileExt ? `.${fileExt}` : '')
            );
            const cType = contentType(fileExt) || undefined;
            await props.env.fileService.writeFile(this.dataProvider.inwestycjaId, filename, file.data, cType);
            return filename;
        }
        throw new Error(`Brak odnośników w zasobie: ${JSON.stringify(zasob)}`);
    }

    private readFileExt(file: AxiosResponse<any>): string {

        const extExpr = /filename="?.+\.(\w+)"?/
            .exec(file.headers['content-disposition']);

        if (extExpr && extExpr[1]) {
            return extExpr[1];
        }

        const contentType = file.headers['content-type'];
        const ext = extension(contentType);
        if (ext) {
            return ext;
        }

        const expResult = /\.(\w{1,})$/.exec(file.config.url || '');
        if (expResult && expResult[1]) {
            return expResult[1];
        }

        return '';
    }

}

export default ProvideOfferTask4;
