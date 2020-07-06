
import { IMultidomDetails, IMultiDomListElement } from './MultidomModel';
import { IOfertaDane } from '../../../core/oferta/model/IOfertaModel';


export default (listItem: IMultiDomListElement, detale: IMultidomDetails | null): { id: string, dane: IOfertaDane } => {

    const result: IOfertaDane = {
        zasobyDoPobrania: [],
        ...listItem,
        ...detale,
    };

    return { id: listItem.id, dane: result };
}
