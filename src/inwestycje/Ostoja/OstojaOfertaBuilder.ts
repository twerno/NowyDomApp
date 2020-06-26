import { IOfertaDane, Typ } from '../../core/oferta/model/IOfertaModel';
import { IOstojaListElement, IOstojaOfferDetails } from './OstojaModel';

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
