
import { IOfertaDane, isRawData } from '../../../core/oferta/model/IOfertaModel';
import { IEuroStylListElement, IEuroStylOfferDetails } from './EuroStylModel';


export default (listItem: IEuroStylListElement, detale: IEuroStylOfferDetails | null): { id: string, dane: IOfertaDane } => {

    const result: IOfertaDane = {
        zasobyDoPobrania: [],
        cechy: listItem.cechy,
        lpPokoj: listItem.lpPokoj,
        metraz: listItem.metraz,
        nrLokalu: listItem.nrLokalu,
        pietro: listItem.pietro,
        status: listItem.status,
        typ: listItem.typ,
        ...detale,
        liczbaKondygnacji: undefined,
        stronySwiata: undefined,
        odbior: undefined,
        offerDetailsUrl: isRawData(listItem.offerDetailsUrl) ? undefined : listItem.offerDetailsUrl,
        budynek: detale?.budynek,
        cena: detale?.cena
    };

    return { id: listItem.id, dane: result };
}
