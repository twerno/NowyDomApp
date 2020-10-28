
import { IOfertaDane } from '../../../core/oferta/model/IOfertaModel';
import { IDomapartParserProps } from './Domapart';
import { IDomapartListElement, IDomapartOfferDetails } from './DomapartModel';


export default (listItem: IDomapartListElement, detale: IDomapartOfferDetails | null, props: IDomapartParserProps): { id: string, dane: IOfertaDane } => {

    const zasobyDoPobrania = detale?.zasobyDoPobrania ?? [];

    const result: IOfertaDane = {
        zasobyDoPobrania,
        cechy: detale?.cechy || { map: {} },
        lpPokoj: listItem.lpPokoj,
        metraz: listItem.metraz,
        nrLokalu: listItem.nrLokalu,
        pietro: listItem.pietro,
        status: listItem.status,
        typ: listItem.typ,
        liczbaKondygnacji: undefined,
        stronySwiata: undefined,
        budynek: listItem.budynek,
        cena: undefined,
        odbior: listItem.odbior,
        offerDetailsUrl: listItem.offerDetailsUrl
    };

    return { id: listItem.id, dane: result };
}
