
import { IOfertaDane } from '../../../core/oferta/model/IOfertaModel';
import { IHSDomParserProps } from './HSDom';
import { IHSDomListElement, IHSDomOfferDetails } from './HSDomModel';


export default (listItem: IHSDomListElement, detale: IHSDomOfferDetails | null, props: IHSDomParserProps): { id: string, dane: IOfertaDane } => {

    const zasobyDoPobrania = detale?.zasobyDoPobrania ?? [];

    const result: IOfertaDane = {
        zasobyDoPobrania,
        cechy: { map: {} },
        lpPokoj: listItem.lpPokoj,
        metraz: listItem.metraz,
        nrLokalu: listItem.nrLokalu,
        pietro: listItem.pietro,
        status: listItem.status,
        typ: listItem.typ,
        liczbaKondygnacji: undefined,
        stronySwiata: undefined,
        budynek: listItem.budynek,
        cena: listItem.cena,
        odbior: undefined,
        offerDetailsUrl: listItem.offerDetailsUrl
    };

    return { id: listItem.id, dane: result };
}
