import Axios, { AxiosResponse } from "axios";
import { contentType, extension } from "mime-types";
import { IDataProvider, IListElement } from "../IOfertaProvider";
import { IOfertaRecord } from "../model/IOfertaModel";
import AbstractZapiszZmianyTask, { getEmptyProvideOfferStats } from "./AbstractZapiszZmianyTask";
import { IProvideOfferTaskProps } from "./ProvideOfferTask1";

/**
 * pobranie dodatkowych zasobów, odłożenie ich na s3 i aktualizacja bazy danych
 */
class ProvideOfferTask4<T extends IListElement = IListElement, D = any> extends AbstractZapiszZmianyTask<T, D> {

    public constructor(
        private ofertaId: string,
        private stan: IOfertaRecord,
        dataProvider: IDataProvider<T, D>,
        public readonly priority?: number) {
        super(dataProvider);
    }

    public async run(errors: any[], props: IProvideOfferTaskProps) {

        const doPobrania = this.stan.data.zasobyDoPobrania
            .filter(z => !this.zasobPobrany(z));

        // const resourcesDownloaded = {count: new Set<string>()};
        // wywolywanie operacji synchroniczne
        for (const res of doPobrania) {
            await this.pobierzIZapisz(res, errors, props);
        }

        return [];
    }

    private zasobPobrany(zasob: { id: string }) {
        return !!this.stan.data.zasobyPobrane
            && !!this.stan.data.zasobyPobrane.find(z => z.id === zasob.id);
    }

    private async pobierzIZapisz(
        zasob: { id: string; url: string; },
        errors: any[],
        props: IProvideOfferTaskProps
    ) {
        console.log('pobieranie', JSON.stringify(zasob), this.ofertaId);
        const s3Filename = await this.pobierzIZapiszNaS3(zasob, props);

        const stan = this.stan || await this.pobierzStan(this.ofertaId, props);
        const zmiana = { ...stan?.data, zasobyPobrane: [...stan?.data.zasobyPobrane || [], { id: zasob.id, s3Filename }] };
        await this.wyliczZmianyIZapisz(this.ofertaId, zmiana, errors, {...props, stats: getEmptyProvideOfferStats()}, stan);
        props.stats.resourcesDownloaded.count.add(`${this.ofertaId}-${zasob.id}`);
    }

    private async pobierzIZapiszNaS3(
        zasob: { id: string; url: string; },
        props: IProvideOfferTaskProps
    ) {
        const file = await Axios({ responseType: 'arraybuffer', url: zasob.url });
        const fileExt = this.readFileExt(file);
        const filename = `${this.ofertaId}_${zasob.id}.${fileExt}`;
        const cType = contentType(fileExt) || undefined;
        await props.env.fileService.writeFile(this.dataProvider.inwestycjaId, filename, file.data, cType);
        return filename;
    }

    private readFileExt(file: AxiosResponse<any>): string {

        const extExpr = /filename=".+\.(\w+)"/
            .exec(file.headers['content-disposition']);

        if (extExpr && extExpr[1]) {
            return extExpr[1];
        }

        const contentType = file.headers['content-type'];
        const ext = extension(contentType);
        if (ext) {
            return ext;
        }

        return '';
    }

}

export default ProvideOfferTask4;
