
import { IOfertaDane } from '../../../core/oferta/model/IOfertaModel';
import { IEuroStylListElement, IEuroStylOfferDetails } from './EuroStylModel';
import { StronaSwiata } from '@src/core/oferta/model/StronySwiata';
import { IRawData, isRawData } from '@src/core/oferta/model/IRawData';


export default (listItem: IEuroStylListElement, detale: IEuroStylOfferDetails | null): { id: string, dane: IOfertaDane } => {

    const stronySwiata: Array<StronaSwiata | IRawData> = listItem.stronySwiata.list;
    if (listItem.stronySwiata.raw?.length) {
        listItem.stronySwiata.raw
            .map(raw => ({ raw }))
            .forEach(r => stronySwiata.push(r));
    };

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
        stronySwiata,
        odbior: listItem.odbior,
        offerDetailsUrl: isRawData(listItem.offerDetailsUrl) ? undefined : listItem.offerDetailsUrl,
        budynek: detale?.budynek,
        cena: detale?.cena
    };

    return { id: listItem.id, dane: result };
}
