
import { IMultidomDetails, IMultiDomListElement } from './MultidomModel';
import { IOfertaDane, isRawData } from '../../../core/oferta/model/IOfertaModel';


export default (listItem: IMultiDomListElement, detale: IMultidomDetails | null): { id: string, dane: IOfertaDane } => {

    const result: IOfertaDane = {
        zasobyDoPobrania: [],
        ...listItem,
        ...detale,
        liczbaKondygnacji: undefined,
        stronySwiata: undefined,
        odbior: undefined,
        offerDetailsUrl: isRawData(listItem.offerDetailsUrl) ? undefined : listItem.offerDetailsUrl,
        budynek: listItem.budynek,
        cena: listItem.cena
    };

    return { id: listItem.id, dane: result };
}
