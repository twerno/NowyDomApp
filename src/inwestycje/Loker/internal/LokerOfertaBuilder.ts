
import { IRawData } from '@src/core/oferta/model/IRawData';
import { StronaSwiata } from '@src/core/oferta/model/StronySwiata';
import { IOfertaDane } from '../../../core/oferta/model/IOfertaModel';
import { ILokerListElement, ILokerOfferDetails } from './LokerModel';


export default (listItem: ILokerListElement, detale: ILokerOfferDetails | null): { id: string, dane: IOfertaDane } => {

    const stronySwiata: Array<StronaSwiata | IRawData> = listItem.stronySwiata.list;
    if (listItem.stronySwiata.raw?.length) {
        listItem.stronySwiata.raw
            .map(raw => ({ raw }))
            .forEach(r => stronySwiata.push(r));
    };

    const result: IOfertaDane = {
        zasobyDoPobrania: listItem.zasobyDoPobrania,
        cechy: listItem.cechy,
        lpPokoj: listItem.lpPokoj,
        metraz: listItem.metraz,
        nrLokalu: listItem.nrLokalu,
        pietro: listItem.pietro,
        status: listItem.status,
        typ: listItem.typ,
        liczbaKondygnacji: undefined,
        stronySwiata,
        budynek: listItem.budynek,
        cena: undefined,
        odbior: undefined,
        offerDetailsUrl: listItem.offerDetailsUrl
    };

    return { id: listItem.id, dane: result };
}
