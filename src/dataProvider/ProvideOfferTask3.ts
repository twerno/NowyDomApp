import AbstractZapiszZmianyTask, { IProvideOfferStats } from "./AbstractZapiszZmianyTask";
import { IDataProvider, IListElement } from "./IOfertaProvider";
import { IOfertaDane } from "./IOfertaRecord";
import ProvideOfferTask4 from "./ProvideOfferTask4";

/**
 * zapisanie zmian w ofercie do bazy
 * jeśli była zmiana nadzienie kolejnej akcji
 */
class ProvideOfferTask3<T extends IListElement = IListElement, D = any> extends AbstractZapiszZmianyTask<T, D> {

    public constructor(
        private ofertaId: string,
        private ofertaData: IOfertaDane | null,
        dataProvider: IDataProvider<T, D>,
        public readonly priority?: number) {
        super(dataProvider);
    }

    public async run(errors: any[], stats: IProvideOfferStats) {

        const stan = await this.pobierzStan(this.ofertaId);

        const data = this.ofertaData
            ? { ...this.ofertaData, zasobyPobrane: stan?.data.zasobyPobrane }
            : null;
        const zmiana = await this.wyliczZmianyIZapisz(this.ofertaId, data, errors, stats, stan);

        return new ProvideOfferTask4(this.ofertaId, zmiana?.rekord || stan, this.dataProvider, (this.priority || 0) + 1)
    }

}

export default ProvideOfferTask3;
