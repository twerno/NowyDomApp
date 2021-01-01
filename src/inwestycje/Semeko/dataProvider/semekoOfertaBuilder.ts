import { IOfertaDane } from '../../../core/oferta/model/IOfertaModel';
import { ISemekoDetails, ISemekoListElement } from './SemekoModel';
import { Typ } from '../../../core/oferta/model/Typ';
import { isRawData } from '@src/core/oferta/model/IRawData';

export default (item: ISemekoListElement, detale: ISemekoDetails | null): { id: string, dane: IOfertaDane } => {

    const zasobyDoPobrania = [...item.zasobyDoPobrania, ...detale?.zasobyDoPobrania || []];

    const result: IOfertaDane = {
        typ: Typ.MIESZKANIE,
        ...item,
        ...detale,
        zasobyDoPobrania,
        zasobyPobrane: [],
        liczbaKondygnacji: undefined,
        stronySwiata: detale?.stronySwiata,
        cena: undefined,
        offerDetailsUrl: isRawData(item.offerDetailsUrl) ? undefined : item.offerDetailsUrl
    };

    return { id: item.id, dane: result };
}
