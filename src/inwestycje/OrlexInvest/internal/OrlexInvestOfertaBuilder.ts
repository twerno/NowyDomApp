
import { isRawData } from '@src/core/oferta/model/IRawData';
import { IOfertaDane } from '../../../core/oferta/model/IOfertaModel';
import { IOrlexInvestListElement, IOrlexInvestOfferDetails } from './OrlexInvestModel';

export default (listItem: IOrlexInvestListElement, detale: IOrlexInvestOfferDetails | null): { id: string, dane: IOfertaDane } => {

    const result: IOfertaDane = {
        zasobyDoPobrania: listItem.zasobyDoPobrania,
        cechy: { map: {} },
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
        budynek: listItem?.budynek,
        cena: listItem?.cena
    };

    return { id: listItem.id, dane: result };
}
