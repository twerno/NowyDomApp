import { IOfertaDane, Typ } from '../../dataProvider/IOfertaRecord';
import { IOstojaListElement, IOstojaOfferDetails } from './OstojaModel';

export default (listItem: IOstojaListElement, detale?: IOstojaOfferDetails, pdfUrl?: string): { id: string, dane: IOfertaDane } => {

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
