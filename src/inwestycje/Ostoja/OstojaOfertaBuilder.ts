import { IOfertaDane } from '../../core/oferta/model/IOfertaModel';
import { IOstojaListElement, IOstojaOfferDetails } from './OstojaModel';
import { Typ } from '../../core/oferta/model/Typ';

export default (listItem: IOstojaListElement, detale: IOstojaOfferDetails | null): { id: string, dane: IOfertaDane } => {

    const zasobyDoPobrania = detale?.sourceOfertaPdfUrl
        ? [{ id: 'ofertaPdf', url: detale?.sourceOfertaPdfUrl }]
        : [];

    const result: IOfertaDane = {
        typ: Typ.MIESZKANIE,
        ...listItem,
        ...detale,
        zasobyDoPobrania,
        zasobyPobrane: []
    };

    return { id: listItem.id, dane: result };
}
