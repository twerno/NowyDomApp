import { IOfertaDane, ZASOBY } from '../../../core/oferta/model/IOfertaModel';
import { IInproListElement, IInproOfferDetails } from './InproModel';
import { Typ } from '../../../core/oferta/model/Typ';

export default (listItem: IInproListElement, detale: IInproOfferDetails | null): { id: string, dane: IOfertaDane } => {

    const zasobyDoPobrania = detale?.sourceOfertaPdfUrl
        ? [{ id: ZASOBY.PDF, url: detale?.sourceOfertaPdfUrl }]
        : [];

    const result: IOfertaDane = {
        ...listItem,
        ...detale,
        zasobyDoPobrania,
        liczbaKondygnacji: undefined,
        odbior: undefined,
        cena: listItem.cena,
        offerDetailsUrl: listItem.offerDetailsUrl
    };

    return { id: listItem.id, dane: result };
}
