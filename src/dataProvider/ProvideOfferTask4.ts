import Axios, { AxiosResponse } from "axios";
import { extension, contentType } from "mime-types";
import S3Utils from "../utils/S3Utils";
import AbstractZapiszZmianyTask from "./AbstractZapiszZmianyTask";
import { IDataProvider, IListElement } from "./IOfertaProvider";
import { IOfertaRecord } from "./IOfertaRecord";

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

    public async run(errors: any[]) {

        const doPobrania = this.stan.data.zasobyDoPobrania
            .filter(z => !this.zasobPobrany(z));

        // wywolywanie operacji synchroniczne
        for (const res of doPobrania) {
            await this.pobierzIZapisz(res, errors);
        }

        return [];
    }

    private zasobPobrany(zasob: { id: string }) {
        return !!this.stan.data.zasobyPobrane
            && !!this.stan.data.zasobyPobrane.find(z => z.id === zasob.id);
    }

    private async pobierzIZapisz(zasob: { id: string; url: string; }, errors: any[]) {
        console.log('pobieranie', JSON.stringify(zasob), this.ofertaId);
        const s3Filename = await this.pobierzIZapiszNaS3(zasob);

        const stan = await this.pobierzStan(this.ofertaId);
        const zmiana = { ...stan.data, zasobyPobrane: [...stan.data.zasobyPobrane || [], { id: zasob.id, s3Filename }] };
        await this.wyliczZmianyIZapisz(this.ofertaId, zmiana, errors, stan);
    }

    private async pobierzIZapiszNaS3(zasob: { id: string; url: string; }) {
        const file = await Axios({ responseType: 'arraybuffer', url: zasob.url });
        const fileExt = this.readFileExt(file);
        const filename = `${this.ofertaId}_${zasob.id}.${fileExt}`;
        const cType = contentType(fileExt) || undefined;
        await S3Utils.putFile(this.dataProvider.inwestycjaId, filename, file.data, cType);
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

