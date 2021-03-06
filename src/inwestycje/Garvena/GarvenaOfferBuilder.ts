import { IOfertaDane } from '../../core/oferta/model/IOfertaModel';
import { IGarvenaParkDetails, IGarvenaParkListElement } from './GarvenaParkModel';
import { Typ } from '../../core/oferta/model/Typ';

export default (listItem: IGarvenaParkListElement, detale: IGarvenaParkDetails | null): { id: string, dane: IOfertaDane } => {

    const result: IOfertaDane = {
        typ: Typ.DOM
        , ...listItem
        , cechy: { map: {} },
        budynek: undefined,
        cena: undefined,
        pietro: undefined,
        stronySwiata: undefined,
        offerDetailsUrl: undefined,
    };

    return { id: listItem.id, dane: result };
}
