
import { IOfertaDane } from '../../../core/oferta/model/IOfertaModel';
import { INorthStarDevListElement, INorthStarDevOfferDetails } from './NorthStarDevModel';


export default (listItem: INorthStarDevListElement, detale: INorthStarDevOfferDetails | null): { id: string, dane: IOfertaDane } => {

    const result: IOfertaDane = {
        zasobyDoPobrania: listItem.zasobyDoPobrania,
        cechy: { map: {} },
        lpPokoj: listItem.lpPokoj,
        metraz: listItem.metraz,
        nrLokalu: listItem.nrLokalu,
        pietro: listItem.pietro,
        status: listItem.status,
        typ: listItem.typ,
        liczbaKondygnacji: undefined,
        stronySwiata: undefined,
        budynek: undefined,
        cena: undefined,
        odbior: undefined,
        offerDetailsUrl: undefined
    };

    return { id: listItem.id, dane: result };
}
