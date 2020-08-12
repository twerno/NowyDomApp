
import { IOfertaDane } from '../../../core/oferta/model/IOfertaModel';
import { IMatBudListElement, IMatBudOfferDetails } from './MatBudModel';

export default (listItem: IMatBudListElement, detale: IMatBudOfferDetails | null): { id: string, dane: IOfertaDane } => {

    const result: IOfertaDane = {
        zasobyDoPobrania: listItem.zasobyDoPobrania,
        cechy: { map: {} },
        lpPokoj: undefined,
        metraz: listItem.metraz,
        nrLokalu: listItem.nrLokalu,
        pietro: listItem.pietro,
        status: listItem.status,
        typ: listItem.typ,
        liczbaKondygnacji: undefined,
        stronySwiata: undefined,
        odbior: undefined,
        offerDetailsUrl: undefined,
        budynek: listItem?.budynek,
        cena: undefined
    };

    return { id: listItem.id, dane: result };
}
