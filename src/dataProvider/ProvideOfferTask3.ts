import AbstractZapiszZmianyTask from "./AbstractZapiszZmianyTask";
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

    public async run(errors: any[]) {
        const zmiana = await this.wyliczZmianyIZapisz(this.ofertaId, this.ofertaData, errors);

        return zmiana === null
            ? []
            : new ProvideOfferTask4(this.ofertaId, zmiana.rekord, this.dataProvider, this.priority)
    }

}

export default ProvideOfferTask3;

