import { IOfertaDane, Typ } from '../../dataProvider/IOfertaRecord';
import { IOstojaListElement, IOstojaOfferDetails } from './OstojaModel';

export default (listItem: IOstojaListElement, detale?: IOstojaOfferDetails, pdfUrl?: string): { id: string, dane: IOfertaDane } => {

    const result: IOfertaDane = {
        typ: Typ.MIESZKANIE,
        ...listItem,
        ...detale,
    };

    return { id: listItem.id, dane: result };
}
